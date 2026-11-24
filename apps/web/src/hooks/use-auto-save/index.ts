import { useRef, useState, type KeyboardEvent } from 'react';
import type { FormValues } from '@/components/ui/form/form/types';
import { checkField } from '@/lib';
import { useHttp } from '../use-http';
import type { AutoSaveOptions, AutoSaveResult } from './types';

export type { AutoSaveOptions, AutoSaveResult } from './types';

/**
 * Saves a form field by field: leaving the control (blur or Enter) sends that
 * field alone, and only when it differs from what the server last confirmed.
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
	const [failed, setFailed] = useState<readonly string[]>([]);

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

	const fail = (name: string): void =>
		setFailed((current) => (current.includes(name) ? current : [...current, name]));

	const pass = (name: string): void =>
		setFailed((current) =>
			current.includes(name) ? current.filter((item) => item !== name) : current,
		);

	const commit = (name: keyof TValues & string): void => {
		const values = form.values();
		const checked = checkField({ schema, name, value: values[name], values });

		if (!checked.ok) {
			form.setErrors({ ...form.errors, [name]: checked.messages });
			return;
		}

		if (checked.value === saved[name]) {
			// Nothing is sent, so nothing will answer this field.
			forget({ names: [name] });
			pass(name);
			return;
		}

		const patch = { [name]: checked.value } as Partial<TValues>;

		setPending(name);
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
					fail(name);
					return;
				}

				// Answers the value that was sent, not the one typed while it was in flight.
				const latest = form.values();
				const answered = checkField({ schema, name, value: latest[name], values: latest });
				if (!answered.ok || answered.value !== checked.value) return;

				pass(name);
				forget({ names: [name] });
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
		failed: (name) => failed.includes(name),
	};
};
