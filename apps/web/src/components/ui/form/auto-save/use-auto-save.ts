import { useRef, useState, type KeyboardEvent } from 'react';
import type { FieldWiring } from '@/components/ui/form/field/wiring';
import type { FormValues } from '@/components/ui/form/form/types';
import { checkField } from '@/lib';
import type { AutoSaveAck, AutoSaveOptions } from './types';

const NO_WIRING: FieldWiring = {};

type Send = (patch: Partial<FormValues>) => Promise<AutoSaveAck | null>;

export const useAutoSave = <TValues extends FormValues>({
	form,
	schema,
	initial,
	autosave,
	commitOn = 'leave',
}: AutoSaveOptions<TValues>): FieldWiring => {
	const queue = useRef<Promise<unknown>>(Promise.resolve());
	const [saved, setSaved] = useState<TValues>(initial);
	const [pending, setPending] = useState<string | null>(null);
	const [failed, setFailed] = useState<readonly string[]>([]);

	if (autosave === undefined) return NO_WIRING;

	const send = autosave.fetchData as Send;
	const loading = autosave.loading;

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
			forget({ names: [name] });
			pass(name);
			return;
		}

		const patch = { [name]: checked.value } as Partial<FormValues>;

		setPending(name);
		queue.current = queue.current
			.then(() => send(patch))
			.then((result) => {
				if (result === null) return;

				if (!result.ok) {
					fail(name);
					return;
				}

				setSaved((previous) => ({ ...previous, ...(result.data as Partial<TValues>) }));

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

	const handler = (name: keyof TValues & string): Record<string, unknown> =>
		commitOn === 'change'
			? { onChange: () => commit(name) }
			: { onBlur: blur(name), onKeyDown: enter(name) };

	return Object.fromEntries(
		Object.keys(initial).map((name) => [
			name,
			{ loading: busy(name), invalid: rejected(name), ...handler(name) },
		]),
	);
};
