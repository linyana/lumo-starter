import type { LumoFormProps } from '@/components/ui/form';

export type { FormErrors } from '@/components/ui/form';

export type FormProps<Values extends Record<string, unknown> = Record<string, unknown>> =
	LumoFormProps<Values>;
