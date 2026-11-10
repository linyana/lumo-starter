import { LumoForm } from '@/components/ui/form';
import type { FormProps } from './types';

export type { FormErrors, FormProps } from './types';

/** The fields as one submission: their values, their validation, and each verdict back on its field. */
export const Form = <Values extends Record<string, unknown> = Record<string, unknown>>({
	children,
	className,
	...props
}: FormProps<Values>) => (
	<LumoForm<Values> className={className} {...props}>
		{children}
	</LumoForm>
);
