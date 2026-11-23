import type { ErrorCode } from '@lumo/shared';

export const ERRORS: Record<ErrorCode, { status: number; message: string }> = {
	BAD_REQUEST: { status: 400, message: 'Bad request' },
	VALIDATION_FAILED: { status: 400, message: 'The request contains invalid fields' },
	UNAUTHORIZED: { status: 401, message: 'Sign in to continue' },
	FORBIDDEN: { status: 403, message: 'You do not have permission to do that' },
	NOT_FOUND: { status: 404, message: 'Not found' },
	CONFLICT: { status: 409, message: 'That already exists' },
	RATE_LIMITED: { status: 429, message: 'Too many requests, try again later' },
	SERVICE_UNAVAILABLE: { status: 503, message: 'The database is busy, try again in a moment' },
	INTERNAL: { status: 500, message: 'Something went wrong' },
};
