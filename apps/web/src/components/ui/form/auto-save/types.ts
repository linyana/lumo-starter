import type { ZodType } from 'zod';
import type { FormInstance, FormValues } from '@/components/ui/form/form/types';

/**
 * The subset of a `useHttp` result a form needs: the request, and whether it is in flight. The
 * page builds it with `useHttp`, so the toasts, the errors and the in-flight flag are the ones it
 * already knows.
 */
export type AutoSaveHandle = {
	/**
	 * `useHttp` narrows this to the endpoint's variables, and only the form knows the patch it
	 * builds, so the shape is read where the request is made rather than here.
	 */
	fetchData: (patch: never) => Promise<AutoSaveAck | null>;
	loading: boolean;
};

export type AutoSaveAck = { ok: true; data: unknown } | { ok: false; error: unknown };

export type AutoSaveOptions<TValues extends FormValues> = {
	form: FormInstance;
	schema?: ZodType;
	initial: TValues;
	autosave?: AutoSaveHandle;
	/**
	 * What ends an edit. `leave` waits for blur or Enter, which an input needs: half a typed
	 * address is not a value. A control whose options are final states submits on `change`.
	 */
	commitOn?: 'leave' | 'change';
};
