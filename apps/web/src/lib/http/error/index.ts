import type { ApiFailure, ErrorCode, FieldError } from '@lumo/shared';

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
	code?: ErrorCode;
	message?: string;
	details?: readonly FieldError[];
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

	get isExpected(): boolean {
		return this.status >= 400 && this.status < 500;
	}
}

function normalizeDetails(details: unknown): FieldError[] {
	if (!Array.isArray(details)) return [];

	return details.flatMap((item): FieldError[] => {
		if (!item || typeof item !== 'object') return [];

		const record = item as { path?: unknown; message?: unknown };
		if (typeof record.message !== 'string') return [];

		return [{ path: typeof record.path === 'string' ? record.path : '', message: record.message }];
	});
}

export function fromHttpStatus({
	status,
	body,
	originalError,
}: {
	status: number;
	body: unknown;
	originalError?: unknown;
}): ApiError {
	const failure = (body ?? {}) as Partial<ApiFailure>;
	const error = failure.error;

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

interface AxiosLikeError {
	isAxiosError?: boolean;
	response?: { status: number; data: unknown };
	code?: string;
}

export function toApiError(error: unknown): ApiError {
	if (error instanceof ApiError) return error;

	const axiosError = error as AxiosLikeError | undefined;

	if (axiosError?.isAxiosError) {
		if (axiosError.response) {
			return fromHttpStatus({
				status: axiosError.response.status,
				body: axiosError.response.data,
				originalError: error,
			});
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

export const errorMessage = (error: unknown): string => toApiError(error).message;

export const inlineErrorMessage = (error: unknown): string | null => {
	if (!error) return null;
	const apiError = toApiError(error);
	return apiError.isExpected ? apiError.message : null;
};

export const errorFields = (error: unknown): Record<string, string> => {
	const fields: Record<string, string> = {};

	for (const detail of toApiError(error).details) {
		if (detail.path && !(detail.path in fields)) fields[detail.path] = detail.message;
	}

	return fields;
};
