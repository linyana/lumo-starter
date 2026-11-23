import type { ApiSuccess, AuthResult } from '@lumo/shared';
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, toApiError } from '../error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
	accessToken = token;
	if (token) unauthorizedNotified = false;
};

export const getAccessToken = (): string | null => accessToken;

let unauthorizedHandler: (() => void) | null = null;
let unauthorizedNotified = false;

export const onUnauthorized = (handler: () => void): void => {
	unauthorizedHandler = handler;
};

const notifyUnauthorized = (): void => {
	if (unauthorizedNotified) return;
	unauthorizedNotified = true;
	accessToken = null;
	unauthorizedHandler?.();
};

export const http = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: { 'content-type': 'application/json' },
});

http.interceptors.request.use((config) => {
	if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
	return config;
});

const refreshClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

const REFRESH_PATH = '/auth/refresh';

export type RefreshOutcome =
	| { status: 'refreshed'; result: AuthResult }
	| { status: 'expired' }
	| { status: 'unavailable' };

let refreshing: Promise<RefreshOutcome> | null = null;

export const refreshSession = (): Promise<RefreshOutcome> => {
	refreshing ??= refreshClient
		.post<ApiSuccess<AuthResult>>(REFRESH_PATH)
		.then((response): RefreshOutcome => {
			const result = response.data.data;
			setAccessToken(result.accessToken);
			return { status: 'refreshed', result };
		})
		.catch((error: unknown): RefreshOutcome => {
			const response = axios.isAxiosError(error) ? error.response : undefined;
			const rejected = response !== undefined && response.status < 500;

			if (rejected) setAccessToken(null);
			return rejected ? { status: 'expired' } : { status: 'unavailable' };
		})
		.finally(() => {
			refreshing = null;
		});

	return refreshing;
};

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

const NO_REFRESH_PATHS = new Set([REFRESH_PATH, '/auth/login', '/auth/register', '/auth/logout']);

http.interceptors.response.use(
	(response) => response,
	async (error: unknown) => {
		const config = axios.isAxiosError(error)
			? (error.config as RetriableConfig | undefined)
			: undefined;

		const carriedToken = Boolean(config?.headers.Authorization);
		const isAuthFailure = axios.isAxiosError(error) && error.response?.status === 401;

		if (!isAuthFailure || !config || !carriedToken || config._retried) {
			throw toApiError(error);
		}
		if (NO_REFRESH_PATHS.has(config.url ?? '')) throw toApiError(error);

		config._retried = true;
		const outcome = await refreshSession();

		if (outcome.status === 'refreshed') {
			config.headers.Authorization = `Bearer ${outcome.result.accessToken}`;
			return http.request(config);
		}

		if (outcome.status === 'unavailable') {
			throw new ApiError({
				status: 0,
				message: 'We could not confirm your session. Please try again in a moment.',
				originalError: error,
			});
		}

		notifyUnauthorized();
		throw new ApiError({
			status: 401,
			code: 'UNAUTHORIZED',
			message: 'Your session has expired. Please sign in again.',
			sessionExpired: true,
			originalError: error,
		});
	},
);

const unwrap = <T>(response: AxiosResponse<ApiSuccess<T>>): T => response.data.data;

export const api = {
	get: async <T>({ url, params }: { url: string; params?: Record<string, unknown> }): Promise<T> =>
		unwrap(await http.get<ApiSuccess<T>>(url, { params })),
	post: async <T>({ url, body }: { url: string; body?: unknown }): Promise<T> =>
		unwrap(await http.post<ApiSuccess<T>>(url, body)),
	patch: async <T>({ url, body }: { url: string; body?: unknown }): Promise<T> =>
		unwrap(await http.patch<ApiSuccess<T>>(url, body)),
	send: async ({
		method,
		url,
		body,
	}: {
		method: 'delete' | 'patch' | 'post';
		url: string;
		body?: unknown;
	}): Promise<void> => {
		await http.request({ method, url, data: body });
	},
};
