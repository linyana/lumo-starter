import { Fragment, useLayoutEffect, useRef } from 'react';
import { useAutoSave } from '@/components/ui/form/auto-save/use-auto-save';
import { FieldWiringProvider } from '@/components/ui/form/field/wiring';
import { FormProvider, useForm } from './instance';
import { FormRoot } from './parts';
import type { FormProps, FormValues } from './types';

export { useChanged, useForm, useFormContext, useWatch } from '@/components/ui/form/form/instance';
export type { AutoSaveHandle } from '@/components/ui/form/auto-save/types';
export type {
	FormArgs,
	FormErrors,
	FormInstance,
	FormProps,
	FormValues,
	WatchArgs,
} from '@/components/ui/form/form/types';

const NO_VALUES: FormValues = {};

export const Form = <Input, Values extends Record<string, unknown> = Record<string, unknown>>({
	form,
	schema,
	initial,
	save,
	commitOn,
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

	const wiring = useAutoSave({
		form: instance,
		schema,
		initial: initial ?? NO_VALUES,
		save,
		commitOn,
	});

	useLayoutEffect(() => {
		if (Object.keys(latest.current.errors).length > 0) latest.current.setErrors({});
		latest.current.notify();
	}, []);

	if (!opened.current) {
		instance.seed(initial);
		opened.current = true;
	}
	instance.config({ schema, onSubmit, onChange, settle, element });

	return (
		<FormProvider value={{ form: instance, schema }}>
			<FieldWiringProvider wiring={wiring}>
				<FormRoot
					{...props}
					ref={element}
					errors={instance.errors}
					onFormSubmit={() => instance.submit()}
				>
					<Fragment key={instance.epoch}>{children}</Fragment>
				</FormRoot>
			</FieldWiringProvider>
		</FormProvider>
	);
};
