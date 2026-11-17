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
import { errorFields, firstIssueName, prune, sameValues, toFormErrors } from '@/lib';
import type {
	FormArgs,
	FormConfig,
	FormContextValue,
	FormErrors,
	FormInstance,
	FormValues,
	WatchArgs,
} from '../types';

const EMPTY: FormValues = {};

const FormContext = createContext<FormContextValue | null>(null);

/**
 * One form's values and verdicts, for one screen. Every control under the form writes into it
 * through `set` — which touches a ref, not state, because the controls hold their own DOM value and
 * a form does not need to re-render to know what was typed. Only a verdict re-renders it; a write is
 * announced, so whatever follows one name re-renders on its own.
 *
 * The instance is rebuilt on every render, so the props it reads through `config` are the latest
 * ones — `submit` keeps no closure over an older `onSubmit`.
 */
export const useForm = (): FormInstance => {
	const [errors, setErrorState] = useState<FormErrors>({});
	const [epoch, setEpoch] = useState(0);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const held = useRef<FormValues>(EMPTY);
	const opened = useRef<FormValues>(EMPTY);
	const config = useRef<FormConfig>({});
	const watchers = useRef(new Set<() => void>());
	/** The pruned copy of `held`, kept until the next write so a reader can compare it by identity. */
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

			// A live form hears its own writes, once the reader has stopped. Typing is a burst of them and
			// picking is one, so the pause is the only thing told apart here.
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

	const setErrors = useCallback((input: FormErrors | ZodError): void => {
		setErrorState(input instanceof ZodError ? toFormErrors(input) : input);
	}, []);

	const setApiError = useCallback((error: unknown): boolean => {
		const fields = errorFields(error);
		if (Object.keys(fields).length === 0) return false;

		setErrorState(fields);
		return true;
	}, []);

	/**
	 * The values the form opens with. A ref write and nothing else: it happens while `<Form>` renders,
	 * which may be a different component from the one holding this instance, and a render may not
	 * schedule another component's state. What it leaves behind — a verdict from the last time the
	 * panel was open — is cleared by `<Form>` before it paints.
	 */
	const seed = useCallback((values?: FormValues): void => {
		opened.current = values ?? EMPTY;
		held.current = { ...opened.current };
	}, []);

	const reset = useCallback(
		(name?: string): void => {
			held.current =
				name === undefined
					? { ...opened.current }
					: Object.fromEntries(Object.entries(held.current).filter(([key]) => key !== name));

			setErrorState({});
			setEpoch((count) => count + 1);
			notify();
		},
		[notify],
	);

	const submit = useCallback((): void => {
		const { schema, onSubmit, element } = config.current;
		const values = prune(held.current);
		const parsed = schema === undefined ? null : schema.safeParse(values);

		if (parsed !== null && !parsed.success) {
			setErrorState(toFormErrors(parsed.error));

			const first = firstIssueName(parsed.error);
			const control =
				first === undefined
					? null
					: element?.current?.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`);
			control?.focus();

			return;
		}

		setErrorState({});
		void onSubmit?.((parsed === null ? values : parsed.data) as never);
	}, []);

	return {
		errors,
		epoch,
		get: (name) => held.current[name],
		values: read,
		changed,
		set,
		notify,
		subscribe,
		seed,
		reset,
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

	return useSyncExternalStore(form.subscribe, snapshot);
}

/** Whether the form differs from what it opened with, followed — one re-render per flip. */
export const useChanged = ({ form }: FormArgs): boolean =>
	useSyncExternalStore(form.subscribe, form.changed);

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
