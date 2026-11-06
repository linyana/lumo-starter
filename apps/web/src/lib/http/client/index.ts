import type { ApiSuccess, AuthResult } from '@lumo/shared';
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, toApiError } from '../error';

/** `/api` in dev, proxied by Vite; a deploy that splits origins sets this. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * Access token: memory only. It never touches localStorage, so an injected
 * script has to run while the tab is open to read it — and the durable
 * credential (the refresh cookie) is httpOnly and unreachable from JS.
 */
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
	accessToken = token;
	if (token) unauthorizedNotified = false;
};

export const getAccessToken = (): string | null => accessToken;

/**
 * What to do once the session is truly gone (clear state, go to login, tell the
 * user). One handler, registered by the auth provider.
 */
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

/**
 * A bare client for the refresh call: it must not go through the response
 * interceptor, or a failing refresh would trigger another refresh.
 */
const refreshClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

const REFRESH_PATH = '/auth/refresh';

/**
 * What a refresh attempt amounted to. Only `expired` signs anyone out;
 * `unavailable` is a failure to *check* the session, not to renew it — the
 * distinction is the caller's, so it survives as a value rather than a `null`.
 */
export type RefreshOutcome =
	| { status: 'refreshed'; result: AuthResult }
	| { status: 'expired' }
	| { status: 'unavailable' };

/**
 * Single-flight: ten requests failing with 401 at once must produce one refresh
 * call, not ten. Everyone awaits the same promise, which never rejects — a
 * rejection would leave the other callers with an unhandled error.
 */
let refreshing: Promise<RefreshOutcome> | null = null;

/**
 * Asks the server who this tab is. The auth provider's view of a reload: one
 * call per app, and the retry behind the "unreachable" screen.
 */
export const refreshSession = (): Promise<RefreshOutcome> => {
	refreshing ??= refreshClient
		.post<ApiSuccess<AuthResult>>(REFRESH_PATH)
		.then((response): RefreshOutcome => {
			const result = response.data.data;
			setAccessToken(result.accessToken);
			return { status: 'refreshed', result };
		})
		.catch((error: unknown): RefreshOutcome => {
			// The server rejected the cookie: the session is over. Anything else — a
			// 5xx, offline, a timeout — says nothing about the session, so it is kept.
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

		// A request that carried a token came back 401: the token is stale, not the credentials.
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
			// Signing out here would throw away a session that may still be valid,
			// so the failure is reported as retryable and the next call gets another go.
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

/** Thin typed wrapper so call sites never see the `{ data }` envelope. */
export const api = {
	get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
		unwrap(await http.get<ApiSuccess<T>>(url, { params })),
	post: async <T>(url: string, body?: unknown): Promise<T> =>
		unwrap(await http.post<ApiSuccess<T>>(url, body)),
	patch: async <T>(url: string, body?: unknown): Promise<T> =>
		unwrap(await http.patch<ApiSuccess<T>>(url, body)),
	delete: async (url: string): Promise<void> => {
		await http.delete(url);
	},
};
