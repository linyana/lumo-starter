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

/**
 * One page of a list, and how many of them there are. `pageCount` is answered by the API rather than
 * derived here: the size that was read at and the size that was asked for can differ (a clamped
 * `pageSize`), and only the reading end knows which one the records were cut at.
 */
export type Paginated<T> = {
	items: T[];
	page: number;
	pageSize: number;
	/** How many pages `total` makes at `pageSize`, never fewer than one. */
	pageCount: number;
	total: number;
};
