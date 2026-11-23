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

export const useHttp = <TData, TVariables = void>({
	endpoint,
	...options
}: {
	endpoint: (variables: TVariables) => Promise<TData>;
} & UseHttpOptions<TData, TVariables>): UseHttpResult<TData, TVariables> => {
	const [state, setState] = useState<UseHttpState<TData>>(INITIAL_STATE);

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
