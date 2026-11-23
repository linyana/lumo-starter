import { HttpException } from '@nestjs/common';
import type { ErrorCode } from '@lumo/shared';
import { ERRORS } from './table/index.js';

export type AppExceptionOptions = {
	code?: ErrorCode;
	message?: string;
	status?: number;
	details?: unknown;
};

export class AppException extends HttpException {
	readonly code: ErrorCode;

	constructor(options: AppExceptionOptions | ErrorCode = {}) {
		const { code, message, status, details } =
			typeof options === 'string' ? { code: options } : options;

		const resolved: ErrorCode = code ?? 'INTERNAL';

		super(
			{ code: resolved, message: message ?? ERRORS[resolved].message, details },
			status ?? ERRORS[resolved].status,
		);

		this.code = resolved;
	}
}
