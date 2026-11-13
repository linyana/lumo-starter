import { Fragment, useLayoutEffect, useRef } from 'react';
import { LumoForm } from '@/components/ui/form';
import { FormProvider, useForm } from './instance';
import type { FormProps } from './types';

export { useForm, useFormContext } from './instance';
export type { FormErrors, FormInstance, FormProps, FormValues } from './types';

/**
 * The fields as one submission: their values, the rules they are read by, and each verdict back on
 * its field.
 *
 * It draws nothing of its own — the element is `LumoForm`'s, the values and the verdicts are the
 * instance's — and it does not make the request. `onSubmit` is the caller's, called once every rule
 * has passed, with the parsed values: a body that is not those values is assembled there, because
 * that mapping is the screen's business and not a prop here.
 *
 * `form` is optional. A screen that only submits needs no instance: a `type="submit"` button, or
 * Enter, reaches the same `onSubmit`. One that prefills, resets or submits from a footer keeps the
 * instance from `useForm()` and calls `form.submit()`.
 */
export const Form = <Input, Values extends Record<string, unknown> = Record<string, unknown>>({
	form,
	schema,
	initial,
	onSubmit,
	onChange,
	settle,
	children,
	...props
}: FormProps<Input, Values>) => {
	const own = useForm();
	const instance = form ?? own;
	const element = useRef<HTMLFormElement>(null);
	const opened = useRef(false);
	const latest = useRef(instance);
	latest.current = instance;
	
	useLayoutEffect(() => {
		if (Object.keys(latest.current.errors).length > 0) latest.current.setErrors({});
	}, []);

	if (!opened.current) {
		instance.seed(initial);
		opened.current = true;
	}
	instance.config({ schema, onSubmit, onChange, settle, element });

	return (
		<FormProvider value={{ form: instance, schema }}>
			<LumoForm
				{...props}
				ref={element}
				errors={instance.errors}
				onFormSubmit={() => instance.submit()}
			>
				<Fragment key={instance.epoch}>{children}</Fragment>
			</LumoForm>
		</FormProvider>
	);
};
