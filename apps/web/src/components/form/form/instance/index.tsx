import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from 'react';
import { ZodError } from 'zod';
import { errorFields, firstIssueName, omit, prune, sameValues, toFormErrors } from '@/lib';
import type {
	FormArgs,
	FormConfig,
	FormContextValue,
	FormError,
	FormErrors,
	FormInstance,
	FormValues,
	WatchArgs,
} from '../types';

const EMPTY: FormValues = {};

const NO_ERRORS: FormErrors = {};

/**
 * The same thing said twice. A field can fail with two rules at once and a server sends one sentence,
 * so a list is compared by what it holds — the count and the order of the words are not the message.
 */
const sameMessage = ({ left, right }: { left: FormError; right: FormError }): boolean =>
	(Array.isArray(left) ? left.join('\n') : left) ===
	(Array.isArray(right) ? right.join('\n') : right);

const FormContext = createContext<FormContextValue | null>(null);

export const useForm = (): FormInstance => {
	const [errors, setErrorState] = useState<FormErrors>({});
	const [epoch, setEpoch] = useState(0);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const held = useRef<FormValues>(EMPTY);
	const opened = useRef<FormValues>(EMPTY);
	const revisions = useRef<Record<string, number>>({});
	const nudges = useRef<Record<string, number>>({});
	/** The verdict on screen, kept beside the state so the next one has something to be compared with. */
	const shown = useRef<FormErrors>(NO_ERRORS);
	const config = useRef<FormConfig>({});
	const watchers = useRef(new Set<() => void>());
	const view = useRef<{ from: FormValues; values: FormValues }>({ from: EMPTY, values: EMPTY });

	useEffect(
		() => () => {
			if (timer.current !== null) clearTimeout(timer.current);
		},
		[],
	);

	const notify = useCallback((): void => {
		for (const watcher of watchers.current) watcher();
	}, []);

	const subscribe = useCallback((watcher: () => void): (() => void) => {
		watchers.current.add(watcher);

		return () => {
			watchers.current.delete(watcher);
		};
	}, []);

	/** The verdict on screen, and everyone told about it. */
	const show = useCallback(
		(next: FormErrors): void => {
			shown.current = next;
			setErrorState(next);
			notify();
		},
		[notify],
	);

	/**
	 * A verdict arriving: put on screen, and remembered. A sentence that is already showing is one the
	 * reader has had their chance to read, so being told it again is a reminder — and there is one, on the
	 * first line that repeated, because a form whose every field jittered would say nothing about where
	 * to look. What a reminder looks like belongs to the line that draws it.
	 *
	 * A verdict leaving is `show`: there is nothing arriving for the fields it says nothing about.
	 */
	const publish = useCallback(
		(next: FormErrors): void => {
			const again = Object.entries(next).find(
				([name, message]) =>
					shown.current[name] !== undefined &&
					sameMessage({ left: shown.current[name], right: message }),
			);

			if (again !== undefined) {
				const [name] = again;
				nudges.current = { ...nudges.current, [name]: (nudges.current[name] ?? 0) + 1 };
			}

			show(next);
		},
		[show],
	);

	const read = useCallback((): FormValues => {
		if (view.current.from !== held.current) {
			view.current = { from: held.current, values: prune(held.current) };
		}

		return view.current.values;
	}, []);

	const changed = useCallback(
		(): boolean => !sameValues({ left: read(), right: prune(opened.current) }),
		[read],
	);

	const set = useCallback(
		({ name, value }: { name: string; value: unknown }): void => {
			held.current = { ...held.current, [name]: value };
			notify();

			const { onChange, settle = 0 } = config.current;
			if (onChange === undefined) return;

			if (timer.current !== null) clearTimeout(timer.current);
			timer.current = setTimeout(() => {
				timer.current = null;
				onChange(prune(held.current));
			}, settle);
		},
		[notify],
	);

	const setErrors = useCallback(
		(input: FormErrors | ZodError): void => {
			publish(input instanceof ZodError ? toFormErrors(input) : input);
		},
		[publish],
	);

	const setApiError = useCallback(
		(error: unknown): boolean => {
			const fields = errorFields(error);
			if (Object.keys(fields).length === 0) return false;

			publish(fields);
			return true;
		},
		[publish],
	);

	const seed = useCallback((values?: FormValues): void => {
		opened.current = values ?? EMPTY;
		held.current = { ...opened.current };
	}, []);

	/**
	 * One field starting over: the counter its control is keyed by moves, and its verdict goes with the
	 * value that was just replaced. A field with no verdict is left alone, so nothing re-renders.
	 */
	const startOver = useCallback(
		(name: string): void => {
			revisions.current = { ...revisions.current, [name]: (revisions.current[name] ?? 0) + 1 };

			if (Object.hasOwn(shown.current, name)) {
				const next = { ...shown.current };
				delete next[name];
				show(next);
			}

			notify();
		},
		[notify, show],
	);

	const reset = useCallback(
		(name?: string): void => {
			if (name === undefined) {
				held.current = { ...opened.current };
				show(NO_ERRORS);
				setEpoch((count) => count + 1);
				return;
			}

			held.current =
				opened.current[name] === undefined
					? omit({ values: held.current, name })
					: { ...held.current, [name]: opened.current[name] };
			startOver(name);
		},
		[show, startOver],
	);

	const clear = useCallback(
		(name: string): void => {
			opened.current = omit({ values: opened.current, name });
			held.current = omit({ values: held.current, name });
			startOver(name);
		},
		[startOver],
	);

	const submit = useCallback((): void => {
		const { schema, onSubmit, element } = config.current;
		const values = prune(held.current);
		const parsed = schema === undefined ? null : schema.safeParse(values);

		if (parsed !== null && !parsed.success) {
			publish(toFormErrors(parsed.error));

			const first = firstIssueName(parsed.error);
			const control =
				first === undefined
					? null
					: element?.current?.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`);
			control?.focus();

			return;
		}

		show(NO_ERRORS);
		void onSubmit?.((parsed === null ? values : parsed.data) as never);
	}, [publish, show]);

	return {
		errors,
		epoch,
		revision: (name) => revisions.current[name] ?? 0,
		nudge: (name) => nudges.current[name] ?? 0,
		get: (name) => held.current[name],
		values: read,
		changed,
		set,
		notify,
		subscribe,
		seed,
		reset,
		clear,
		submit,
		setErrors,
		setApiError,
		config: (next) => {
			config.current = { ...config.current, ...next };
		},
	};
};

/**
 * The whole form's values, followed by identity: one object until the next write, so every write
 * re-renders the caller.
 */
export function useWatch({ form }: FormArgs): FormValues;
/** One field's value, followed — `undefined` until something writes that name. */
export function useWatch<Value = unknown>({ form, name }: WatchArgs): Value | undefined;
export function useWatch({ form, name }: FormArgs & { name?: string }): unknown {
	const snapshot = useCallback(
		(): unknown => (name === undefined ? form.values() : form.values()[name]),
		[form.values, name],
	);

	return useSyncExternalStore(form.subscribe, snapshot, snapshot);
}

/** Whether the form differs from what it opened with, followed — one re-render per flip. */
export const useChanged = ({ form }: FormArgs): boolean =>
	useSyncExternalStore(form.subscribe, form.changed, form.changed);

/** The form the caller's fields are in, or `null` when they stand alone. */
export const useFormContext = (): FormContextValue | null => useContext(FormContext);

/** Drawn by `<Form>`; nothing else provides it. */
export const FormProvider = ({
	value,
	children,
}: {
	value: FormContextValue;
	children: ReactNode;
}) => <FormContext.Provider value={value}>{children}</FormContext.Provider>;
