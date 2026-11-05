import type { ErrorCode } from '../error';

/** Every success response is wrapped, so the client has one shape to unwrap. */
export type ApiSuccess<T> = { data: T };

export type ApiFailure = {
	error: {
		code: ErrorCode;
		/** The sentence to show. The API resolved it; nothing to translate. */
		message: string;
		/** Field-level problems from `VALIDATION_FAILED`, or any extra context. */
		details?: unknown;
	};
};

export type FieldError = { path: string; message: string };

export type Paginated<T> = {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
};
