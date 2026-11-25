import type { ZodType } from 'zod';
import type { FormInstance, FormValues } from '@/components/ui/form/form/types';

export type AutoSaveHandle = {
	fetchData: (patch: never) => Promise<AutoSaveAck | null>;
	loading: boolean;
};

export type AutoSaveAck = { ok: true; data: unknown } | { ok: false; error: unknown };

export type AutoSaveOptions<TValues extends FormValues> = {
	form: FormInstance;
	schema?: ZodType;
	initial: TValues;
	autosave?: AutoSaveHandle;
	commitOn?: 'leave' | 'change';
};
