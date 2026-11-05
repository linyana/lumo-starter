import type { ApiFailure, ErrorCode, FieldError } from '@lumo/shared';

/**
 * Every failure converges on `ApiError`:
 * - status 0   transport layer (offline, DNS, timeout, aborted)
 * - 4xx        a request the caller can fix; show it where the user is
 * - 5xx        nothing the user can do; the message stays generic
 */
const STATUS_MESSAGES: Record<number, string> = {
	0: 'Cannot reach the server. Check your connection and try again.',
	400: 'The request was invalid',
	401: 'Your session has expired',
	403: 'You do not have permission to do this',
	404: 'Not found',
	409: 'This conflicts with existing data. Refresh and try again.',
	422: 'Some fields are invalid',
	429: 'Too many requests. Try again shortly.',
	500: 'Something went wrong on our side',
	502: 'Service temporarily unavailable',
	503: 'Service temporarily unavailable',
	504: 'The request timed out',
};

export interface ApiErrorOptions {
	status: number;
	/** Stable machine-readable code from the API. */
	code?: ErrorCode;
	message?: string;
	/** One entry per failed field, as returned by the API. */
	details?: readonly FieldError[];
	/**
	 * Set by the http layer when the session is gone for good. The auth provider
	 * reacts to that on its own, so a caller must not show it a second time.
	 */
	sessionExpired?: boolean;
	originalError?: unknown;
}

export class ApiError extends Error {
	readonly status: number;
	readonly code: ErrorCode | undefined;
	readonly details: readonly FieldError[];
	readonly sessionExpired: boolean;
	readonly originalError: unknown;

	constructor({
		status,
		code,
		message,
		details,
		sessionExpired = false,
		originalError,
	}: ApiErrorOptions) {
		super(message ?? STATUS_MESSAGES[status] ?? `Request failed (HTTP ${status})`);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.details = details ?? [];
		this.sessionExpired = sessionExpired;
		this.originalError = originalError;
	}

	get isNetworkError(): boolean {
		return this.status === 0;
	}

	get isUnauthorized(): boolean {
		return this.status === 401;
	}

	/** 4xx: fixable by the user, so it is worth showing inline as well as as a toast. */
	get isExpected(): boolean {
		return this.status >= 400 && this.status < 500;
	}
}

/** The API sends `FieldError[]`; anything else in `details` is context, not a message. */
function normalizeDetails(details: unknown): FieldError[] {
	if (!Array.isArray(details)) return [];

	return details.flatMap((item): FieldError[] => {
		if (!item || typeof item !== 'object') return [];

		const record = item as { path?: unknown; message?: unknown };
		if (typeof record.message !== 'string') return [];

		return [{ path: typeof record.path === 'string' ? record.path : '', message: record.message }];
	});
}

/** HTTP failure → `ApiError`, using the API's own sentence when there is one. */
export function fromHttpStatus(status: number, body: unknown, originalError?: unknown): ApiError {
	const failure = (body ?? {}) as Partial<ApiFailure>;
	const error = failure.error;

	// A 5xx body only ever says "Internal server error" — no information for the user.
	if (status >= 500 || !error) {
		return new ApiError({ status, originalError });
	}

	return new ApiError({
		status,
		code: error.code,
		message: error.message,
		details: normalizeDetails(error.details),
		originalError,
	});
}

/** Structural match for axios errors — keeps this module free of an axios import. */
interface AxiosLikeError {
	isAxiosError?: boolean;
	response?: { status: number; data: unknown };
	code?: string;
}

/** Any thrown value → `ApiError` (axios failures, `ApiError`, plain errors). */
export function toApiError(error: unknown): ApiError {
	if (error instanceof ApiError) return error;

	const axiosError = error as AxiosLikeError | undefined;

	if (axiosError?.isAxiosError) {
		if (axiosError.response) {
			return fromHttpStatus(axiosError.response.status, axiosError.response.data, error);
		}

		const timedOut = axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT';
		return new ApiError({
			status: 0,
			message: timedOut ? STATUS_MESSAGES[504] : undefined,
			originalError: error,
		});
	}

	return new ApiError({ status: 0, originalError: error });
}

/** Always-displayable text; safe to call with anything. */
export const errorMessage = (error: unknown): string => toApiError(error).message;

/**
 * Only text worth showing inline (4xx). 5xx and network failures return `null`:
 * their message is generic, and the toast already covers them.
 */
export const inlineErrorMessage = (error: unknown): string | null => {
	if (!error) return null;
	const apiError = toApiError(error);
	return apiError.isExpected ? apiError.message : null;
};

/** Field-level details from a 400, keyed by input name. */
export const errorFields = (error: unknown): Record<string, string> => {
	const fields: Record<string, string> = {};

	for (const detail of toApiError(error).details) {
		if (detail.path && !(detail.path in fields)) fields[detail.path] = detail.message;
	}

	return fields;
};
