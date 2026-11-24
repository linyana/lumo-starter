import { useRef, useState, type KeyboardEvent } from 'react';
import type { FieldWiring } from '@/components/ui/form/field/wiring';
import type { FormValues } from '@/components/ui/form/form/types';
import { checkField } from '@/lib';
import type { AutoSaveAck, AutoSaveOptions } from './types';

const NO_WIRING: FieldWiring = {};

type Send = (patch: Partial<FormValues>) => Promise<AutoSaveAck | null>;

/**
 * Saves a form field by field: the edit ends on blur or Enter (or on change, for a control whose
 * options are final states) and sends that field alone, only when it differs from what the server
 * last confirmed. A form without a save handle gets no wiring, so its fields behave as before.
 */
export const useAutoSave = <TValues extends FormValues>({
	form,
	schema,
	initial,
	save,
	commitOn = 'leave',
}: AutoSaveOptions<TValues>): FieldWiring => {
	const queue = useRef<Promise<unknown>>(Promise.resolve());
	const [saved, setSaved] = useState<TValues>(initial);
	const [pending, setPending] = useState<string | null>(null);
	const [failed, setFailed] = useState<readonly string[]>([]);

	if (save === undefined) return NO_WIRING;

	const send = save.fetchData as Send;
	const loading = save.loading;

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

	const check = (name: string) => {
		const values = form.values();
		if (schema === undefined) return { ok: true as const, value: values[name] };

		return checkField({ schema, name, value: values[name], values });
	};

	const commit = (name: keyof TValues & string): void => {
		const checked = check(name);

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

		const patch = { [name]: checked.value } as Partial<FormValues>;

		setPending(name);
		// What is on screen is the last verdict on this field, and the request is what replaces
		// it. A retry that withdraws the message first reports a fix the server has not made yet.
		// Saves land in the order the user made them; one failure must not stop
		// the ones queued behind it.
		queue.current = queue.current
			.then(() => send(patch))
			.then((result) => {
				// A superseded request resolves null: its verdict belongs to a value the
				// field no longer holds.
				if (result === null) return;

				if (!result.ok) {
					fail(name);
					return;
				}

				// The confirmed values are the ones this field is now measured against.
				setSaved((previous) => ({ ...previous, ...(result.data as Partial<TValues>) }));

				// Answers the value that was sent, not the one typed while it was in flight.
				const answered = check(name);
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

	const blur = (name: keyof TValues & string) => () => commit(name);
	const busy = (name: keyof TValues & string): boolean => loading && pending === name;
	const rejected = (name: keyof TValues & string): boolean => failed.includes(name);

	// Field writes the typed value before it runs these, so a change-mode commit reads what the
	// control just reported rather than the value it held before.
	const handler = (name: keyof TValues & string): Record<string, unknown> =>
		commitOn === 'change'
			? { onChange: () => commit(name) }
			: { onBlur: blur(name), onKeyDown: enter(name) };

	// Every field the form starts with is autosaved; the control inside <Field name="..."> picks
	// these up, so a page declares what the field holds and not how it persists.
	return Object.fromEntries(
		Object.keys(initial).map((name) => [
			name,
			{ loading: busy(name), invalid: rejected(name), ...handler(name) },
		]),
	);
};
