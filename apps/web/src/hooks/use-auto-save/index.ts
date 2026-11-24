import { useRef, useState, type KeyboardEvent } from 'react';
import type { FormValues } from '@/components/ui/form/form/types';
import { checkField, patchOf } from '@/lib';
import { useHttp } from '../use-http';
import type { AutoSaveOptions, AutoSaveResult } from './types';

export type { AutoSaveOptions, AutoSaveResult } from './types';

/**
 * Saves a form field by field: leaving the control (blur or Enter) sends only
 * the fields whose value differs from what the server last confirmed.
 */
export const useAutoSave = <TValues extends FormValues>({
	form,
	schema,
	initial,
	endpoint,
	successMessage,
}: AutoSaveOptions<TValues>): AutoSaveResult<TValues> => {
	const queue = useRef<Promise<unknown>>(Promise.resolve());
	const [saved, setSaved] = useState<TValues>(initial);
	const [pending, setPending] = useState<string | null>(null);
	const [failed, setFailed] = useState<string | null>(null);

	const { fetchData, loading } = useHttp({
		form,
		endpoint,
		successMessage,
		onSuccess: (next) => setSaved((previous) => ({ ...previous, ...next })),
	});

	const forget = ({ names }: { names: string[] }): void => {
		const errors = { ...form.errors };
		const shown = names.filter((name) => Object.hasOwn(errors, name));
		if (shown.length === 0) return;

		for (const name of shown) delete errors[name];
		form.setErrors(errors);
	};

	const commit = (name: keyof TValues & string): void => {
		const values = form.values();
		const checked = checkField({ schema, name, value: values[name], values });

		if (!checked.ok) {
			form.setErrors({ ...form.errors, [name]: checked.messages });
			return;
		}

		const patch = patchOf<TValues>({ schema, values, saved });
		const changed = Object.keys(patch)[0];

		if (changed === undefined) {
			// Nothing is sent, so nothing will answer this field.
			forget({ names: [name] });
			setFailed((current) => (current === name ? null : current));
			return;
		}

		setPending(changed);
		// What is on screen is the last verdict on this field, and the request is what replaces
		// it. A retry that withdraws the message first reports a fix the server has not made yet.
		// Saves land in the order the user made them; one failure must not stop
		// the ones queued behind it.
		queue.current = queue.current
			.then(() => fetchData(patch))
			.then((result) => {
				// A superseded request resolves null: its verdict belongs to a value the
				// field no longer holds.
				if (result === null) return;

				if (!result.ok) {
					setFailed(changed);
					return;
				}

				// Answers the values that were sent, not the ones typed while they were in flight.
				const latest = form.values();
				const answered = Object.entries(patch)
					.filter(([key, value]) => latest[key] === value)
					.map(([key]) => key);

				setFailed((current) => (current !== null && answered.includes(current) ? null : current));
				forget({ names: answered });
			})
			.catch(() => undefined);
	};

	const enter =
		(name: keyof TValues & string) =>
		(event: KeyboardEvent<HTMLInputElement>): void => {
			if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;

			event.preventDefault();
			commit(name);
		};

	return {
		saved,
		blur: (name) => () => commit(name),
		enter,
		busy: (name) => loading && pending === name,
		failed: (name) => failed === name,
	};
};
