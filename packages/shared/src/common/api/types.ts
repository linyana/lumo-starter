import type { ErrorCode } from '../error';

export type ApiSuccess<T> = { data: T };

export type ApiFailure = {
	error: {
		code: ErrorCode;
		message: string;
		details?: unknown;
	};
};

export type FieldError = { path: string; message: string };

export type Paginated<T> = {
	items: T[];
	page: number;
	pageSize: number;
	pageCount: number;
	total: number;
};
