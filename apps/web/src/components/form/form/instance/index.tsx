import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { ZodError } from 'zod';
import { errorFields, firstIssueName, prune, toFormErrors } from '@/lib';
import type { FormConfig, FormContextValue, FormErrors, FormInstance, FormValues } from '../types';

const EMPTY: FormValues = {};

const FormContext = createContext<FormContextValue | null>(null);

/**
 * One form's values and verdicts, for one screen. Every control under the form writes into it
 * through `set` — which touches a ref, not state, because the controls hold their own DOM value and
 * a form does not need to re-render to know what was typed. Only a verdict re-renders anything.
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

	useEffect(
		() => () => {
			if (timer.current !== null) clearTimeout(timer.current);
		},
		[],
	);

	const set = useCallback(({ name, value }: { name: string; value: unknown }): void => {
		held.current = { ...held.current, [name]: value };

		// A live form hears its own writes, once the reader has stopped. Typing is a burst of them and
		// picking is one, so the pause is the only thing told apart here.
		const { onChange, settle = 0 } = config.current;
		if (onChange === undefined) return;

		if (timer.current !== null) clearTimeout(timer.current);
		timer.current = setTimeout(() => {
			timer.current = null;
			onChange(prune(held.current));
		}, settle);
	}, []);

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

	const reset = useCallback((name?: string): void => {
		held.current =
			name === undefined
				? { ...opened.current }
				: Object.fromEntries(Object.entries(held.current).filter(([key]) => key !== name));

		setErrorState({});
		setEpoch((count) => count + 1);
	}, []);

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
		values: () => prune(held.current),
		set,
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
