import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError, toastError as raiseToast } from '@/lib';
import type { FetchData, FetchResult, UseHttpOptions, UseHttpResult, UseHttpState } from './types';

export type { FetchData, FetchResult, UseHttpOptions, UseHttpResult, UseHttpState } from './types';

const INITIAL_STATE = { data: null, error: null, loading: false } as const;

/**
 * One hook for both reads and writes: hand it an endpoint function, then call
 * `fetchData` — on mount from an effect for a read, on a click for a write.
 *
 * ```tsx
 * const users = useHttp(listUsers);
 * useEffect(() => {
 * 	users.fetchData({ page });
 * }, [users.fetchData, page]);
 * users.data / users.loading / users.error
 * ```
 *
 * Only the latest call may write state, so a slow response cannot overwrite a
 * newer one. `fetchData` is stable and safe to use in an effect's dependencies.
 */
export const useHttp = <TData, TVariables = void>(
	fn: (variables: TVariables) => Promise<TData>,
	options: UseHttpOptions<TData, TVariables> = {},
): UseHttpResult<TData, TVariables> => {
	const [state, setState] = useState<UseHttpState<TData>>(INITIAL_STATE);

	// Endpoints and options are usually written inline, so the latest values live
	// in a ref instead of rebuilding `fetchData` on every render.
	const latest = useRef({ fn, options });
	useEffect(() => {
		latest.current = { fn, options };
	});

	const requestId = useRef(0);

	const fetchData = useCallback<FetchData<TData, TVariables>>(
		async (variables?: TVariables): Promise<FetchResult<TData> | null> => {
			const id = ++requestId.current;
			const { fn: endpoint, options: current } = latest.current;

			setState((previous) => ({ ...previous, loading: true, error: null }));

			try {
				const data = await endpoint(variables as TVariables);
				if (id !== requestId.current) return null;

				setState({ data, error: null, loading: false });
				current.onSuccess?.(data, variables as TVariables);
				return { ok: true, data };
			} catch (cause) {
				if (id !== requestId.current) return null;

				const error = toApiError(cause);
				if (current.onError) current.onError(error);
				else if (current.toastError !== false && !error.sessionExpired) {
					// A dead session is announced by the auth provider, exactly once.
					raiseToast(error.message);
				}
				setState((previous) => ({ ...previous, error, loading: false }));
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
