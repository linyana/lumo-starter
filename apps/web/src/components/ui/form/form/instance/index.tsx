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

	const show = useCallback(
		(next: FormErrors): void => {
			shown.current = next;
			setErrorState(next);
			notify();
		},
		[notify],
	);

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

export function useWatch({ form }: FormArgs): FormValues;
export function useWatch<Value = unknown>({ form, name }: WatchArgs): Value | undefined;
export function useWatch({ form, name }: FormArgs & { name?: string }): unknown {
	const snapshot = useCallback(
		(): unknown => (name === undefined ? form.values() : form.values()[name]),
		[form.values, name],
	);

	return useSyncExternalStore(form.subscribe, snapshot, snapshot);
}

export const useChanged = ({ form }: FormArgs): boolean =>
	useSyncExternalStore(form.subscribe, form.changed, form.changed);

export const useFormContext = (): FormContextValue | null => useContext(FormContext);

export const FormProvider = ({
	value,
	children,
}: {
	value: FormContextValue;
	children: ReactNode;
}) => <FormContext.Provider value={value}>{children}</FormContext.Provider>;
