import type { ApiError } from '@/lib';

export interface UseHttpOptions<TData, TVariables> {
	/**
	 * Raise a toast when the call fails. On by default, showing the API's
	 * message. Set to `false` when the caller renders the error itself.
	 */
	toastError?: boolean;
	/** Custom failure handling. Supplying this replaces the toast; answering `false` keeps it. */
	onError?: (error: ApiError) => void | boolean;
	/** Runs after a successful call. */
	onSuccess?: (data: TData, variables: TVariables) => void;
}

export interface UseHttpState<TData> {
	/** The last successful payload. Kept while a refetch is in flight or fails. */
	data: TData | null;
	error: ApiError | null;
	loading: boolean;
	/**
	 * Nothing has answered yet: true from the mount until the first call comes back, and again after
	 * `reset`. It is where a `data === null` cannot be read instead — a failure leaves the data empty
	 * too — and what tells a first wait apart from every later one, a screen that opens with skeleton
	 * rows or a blank panel and then keeps what it has while it reads again.
	 */
	initial: boolean;
}

/**
 * Result of an explicit `fetchData` call:
 *
 * - `{ ok: true, data }` — success
 * - `{ ok: false, error }` — failure; the toast / `onError` policy already ran
 * - `null` — a newer call superseded this one
 */
export type FetchResult<TData> = { ok: true; data: TData } | { ok: false; error: ApiError };

/**
 * `fetchData`, shaped by whether the endpoint takes a payload. A `void` endpoint
 * is called bare; anything else must be handed its variables, because an omitted
 * argument reaches the endpoint as `undefined` and the type system would never
 * notice. The tuple keeps the conditional from distributing over a union.
 */
export type FetchData<TData, TVariables> = [TVariables] extends [void]
	? () => Promise<FetchResult<TData> | null>
	: (variables: TVariables) => Promise<FetchResult<TData> | null>;

export interface UseHttpResult<TData, TVariables> extends UseHttpState<TData> {
	/** Runs the call. Bare when the endpoint takes no payload, else with its variables. */
	fetchData: FetchData<TData, TVariables>;
	/**
	 * Clears data and error, and puts the hook back where it opened: `initial` is true again, so the
	 * next wait is a first wait.
	 */
	reset: () => void;
}
