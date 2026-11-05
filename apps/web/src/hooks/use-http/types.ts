import type { ApiError } from '@/lib';

export interface UseHttpOptions<TData, TVariables> {
	/**
	 * Raise a toast when the call fails. On by default, showing the API's
	 * message. Set to `false` when the caller renders the error itself.
	 */
	toastError?: boolean;
	/** Custom failure handling. Supplying this replaces the toast entirely. */
	onError?: (error: ApiError) => void;
	/** Runs after a successful call. */
	onSuccess?: (data: TData, variables: TVariables) => void;
}

export interface UseHttpState<TData> {
	/** The last successful payload. Kept while a refetch is in flight or fails. */
	data: TData | null;
	error: ApiError | null;
	loading: boolean;
}

/**
 * Result of an explicit `fetchData` call:
 *
 * - `{ ok: true, data }` — success
 * - `{ ok: false, error }` — failure; the toast / `onError` policy already ran
 * - `null` — a newer call superseded this one
 */
export type FetchResult<TData> = { ok: true; data: TData } | { ok: false; error: ApiError };

export interface UseHttpResult<TData, TVariables> extends UseHttpState<TData> {
	/** Runs the call, optionally replacing `variables` for this one. */
	fetchData: (variables?: TVariables) => Promise<FetchResult<TData> | null>;
	/** Clears data and error. */
	reset: () => void;
}
