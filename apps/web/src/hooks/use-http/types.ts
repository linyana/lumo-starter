import type { ApiError } from '@/lib';

export interface UseHttpOptions<TData, TVariables> {
	toastError?: boolean;
	onError?: (error: ApiError) => void | boolean;
	loadingMessage?: string;
	successMessage?: string;
	onSuccess?: (data: TData, variables: TVariables) => void;
}

export interface UseHttpState<TData> {
	data: TData | null;
	error: ApiError | null;
	loading: boolean;
	initial: boolean;
}

export type FetchResult<TData> = { ok: true; data: TData } | { ok: false; error: ApiError };

export type FetchData<TData, TVariables> = [TVariables] extends [void]
	? () => Promise<FetchResult<TData> | null>
	: (variables: TVariables) => Promise<FetchResult<TData> | null>;

export interface UseHttpResult<TData, TVariables> extends UseHttpState<TData> {
	fetchData: FetchData<TData, TVariables>;
	reset: () => void;
}
