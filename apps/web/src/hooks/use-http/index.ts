import { useCallback, useEffect, useRef, useState } from 'react';
import {
	toastError as raiseError,
	toastSettle,
	toastSuccess as raiseSuccess,
	toastWait,
	toApiError,
} from '@/lib';
import type { FetchData, FetchResult, UseHttpOptions, UseHttpResult, UseHttpState } from './types';

export type { FetchData, FetchResult, UseHttpOptions, UseHttpResult, UseHttpState } from './types';

const INITIAL_STATE = { data: null, error: null, loading: false, initial: true } as const;

/**
 * One hook for both reads and writes: hand it an endpoint, then call
 * `fetchData` — on mount from an effect for a read, on a click for a write.
 *
 * ```tsx
 * const users = useHttp({ endpoint: usersApi.create });
 * useEffect(() => {
 * 	users.fetchData({ page });
 * }, [users.fetchData, page]);
 * users.data / users.loading / users.error
 * ```
 *
 * Only the latest call may write state, so a slow response cannot overwrite a
 * newer one. `fetchData` is stable and safe to use in an effect's dependencies.
 *
 * `initial` is true until the first call comes back, success or failure — the one
 * wait that has nothing behind it, and so the only one worth a skeleton:
 *
 * ```tsx
 * const first = loading && initial; // the shape of what is coming
 * const later = loading && !initial; // what is already there, covered
 * ```
 */
export const useHttp = <TData, TVariables = void>({
	endpoint,
	...options
}: {
	/** The resource's verb to call: a plain function, so it can be taken off the `api` object. */
	endpoint: (variables: TVariables) => Promise<TData>;
} & UseHttpOptions<TData, TVariables>): UseHttpResult<TData, TVariables> => {
	const [state, setState] = useState<UseHttpState<TData>>(INITIAL_STATE);

	// Endpoints and options are usually written inline, so the latest values live
	// in a ref instead of rebuilding `fetchData` on every render.
	const latest = useRef({ endpoint, options });
	useEffect(() => {
		latest.current = { endpoint, options };
	});

	const requestId = useRef(0);

	const fetchData = useCallback<FetchData<TData, TVariables>>(
		async (variables?: TVariables): Promise<FetchResult<TData> | null> => {
			const id = ++requestId.current;
			const { endpoint, options: current } = latest.current;
			const wait =
				current.loadingMessage === undefined ? undefined : toastWait(current.loadingMessage);

			/** Where the wait this call opened goes; nothing at all when it opened none. */
			const settle = ({ message, failed }: { message?: string; failed?: boolean }): void => {
				if (wait !== undefined) toastSettle({ id: wait, message, failed });
			};

			setState((previous) => ({ ...previous, loading: true, error: null }));

			try {
				const data = await endpoint(variables as TVariables);
				if (id !== requestId.current) {
					settle({});
					return null;
				}

				setState({ data, error: null, loading: false, initial: false });
				current.onSuccess?.(data, variables as TVariables);
				if (wait !== undefined) {
					settle({ message: current.successMessage });
				} else if (current.successMessage !== undefined) {
					raiseSuccess(current.successMessage);
				}
				return { ok: true, data };
			} catch (cause) {
				if (id !== requestId.current) {
					settle({});
					return null;
				}

				const error = toApiError(cause);
				const handled = current.onError?.(error);
				const quiet = current.toastError === false || error.sessionExpired;

				// A handler that answered `false` did not take the failure — the toast is still the
				// default, and the screen has only said where the verdict belongs, not that none is due.
				// The one exception is a session that is gone: the auth provider acts on it by itself.
				const spoken = !quiet && (current.onError === undefined || handled === false);

				if (wait !== undefined) {
					settle({ message: spoken ? error.message : undefined, failed: true });
				} else if (spoken) {
					raiseError(error.message);
				}

				setState((previous) => ({ ...previous, error, loading: false, initial: false }));
				return { ok: false, error };
			}
		},
		[],
	);

	const reset = useCallback(() => {
		requestId.current += 1;
		setState(INITIAL_STATE);
	}, []);

	return { ...state, fetchData, reset };
};
