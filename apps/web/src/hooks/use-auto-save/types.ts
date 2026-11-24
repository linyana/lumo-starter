import type { KeyboardEvent } from 'react';
import type { ZodType } from 'zod';
import type { FormInstance, FormValues } from '@/components/ui/form/form/types';

export type AutoSaveOptions<TValues extends FormValues> = {
	form: FormInstance;
	schema: ZodType;
	initial: TValues;
	endpoint: (patch: Partial<TValues>) => Promise<Partial<TValues>>;
	successMessage?: string;
};

export type AutoSaveResult<TValues extends FormValues> = {
	saved: TValues;
	blur: (name: keyof TValues & string) => () => void;
	enter: (name: keyof TValues & string) => (event: KeyboardEvent<HTMLInputElement>) => void;
	busy: (name: keyof TValues & string) => boolean;
};
