import type { ReactNode } from 'react';
import type { ZodError, ZodType } from 'zod';
import type { AutoSaveHandle } from '@/components/ui/form/auto-save/types';
import type { FormRootProps } from './parts';

export type { AutoSaveHandle } from '@/components/ui/form/auto-save/types';

export type FormErrors = Record<string, FormError>;

export type FormError = string | string[];

export type FormValues = Record<string, unknown>;

export type FormConfig = {
	schema?: ZodType;
	onSubmit?: (values: never) => void | Promise<unknown>;
	onChange?: (values: FormValues) => void;
	settle?: number;
	element?: { current: HTMLFormElement | null };
};

export type FormInstance = {
	readonly errors: FormErrors;
	readonly epoch: number;
	values: () => FormValues;
	changed: () => boolean;
	revision: (name: string) => number;
	nudge: (name: string) => number;
	get: (name: string) => unknown;
	set: (update: { name: string; value: unknown }) => void;
	notify: () => void;
	subscribe: (watcher: () => void) => () => void;
	reset: (name?: string) => void;
	clear: (name: string) => void;
	seed: (values?: FormValues) => void;
	submit: () => void;
	setErrors: (input: FormErrors | ZodError) => void;
	setApiError: (error: unknown) => boolean;
	config: (next: FormConfig) => void;
};

export type FormArgs = {
	form: FormInstance;
};

export type WatchArgs = FormArgs & {
	name: string;
};

export type FormContextValue = {
	form: FormInstance;
	schema?: ZodType;
};

export type FormSubmissionProps<Input> = {
	form?: FormInstance;
	schema?: ZodType<Input>;
	initial?: FormValues;
	autosave?: AutoSaveHandle;
	commitOn?: 'leave' | 'change';
	onSubmit?: (values: Input) => void | Promise<unknown>;
	onChange?: (values: FormValues) => void;
	settle?: number;
	children: ReactNode;
};

export type FormProps<
	Input,
	Values extends Record<string, unknown> = Record<string, unknown>,
> = FormSubmissionProps<Input> &
	Omit<FormRootProps<Values>, 'errors' | 'children' | 'onSubmit' | 'onFormSubmit' | 'onChange'>;
