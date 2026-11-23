import { Form as BaseForm, type FormProps as BaseFormProps } from '@base-ui/react/form';
import type { Ref } from 'react';
import { cn } from '@/lib/utils';
import type { FormErrors } from '../../types';

export type FormRootProps<Values extends Record<string, unknown> = Record<string, unknown>> = Omit<
	BaseFormProps<Values>,
	'className' | 'errors'
> & {
	className?: string;
	errors?: FormErrors;
	ref?: Ref<HTMLFormElement>;
};

export function FormRoot<Values extends Record<string, unknown> = Record<string, unknown>>({
	className,
	...props
}: FormRootProps<Values>) {
	return <BaseForm data-slot="form" className={cn('flex flex-col gap-3', className)} {...props} />;
}
