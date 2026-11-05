import { HttpException } from '@nestjs/common';
import type { ErrorCode } from '@lumo/shared';
import { ERRORS } from './table/index.js';

export type AppExceptionOptions = {
	/** Defaults to `INTERNAL`. */
	code?: ErrorCode;
	/**
	 * The sentence this rule owns — a fixed field rule, a business rule, or text
	 * a third party wrote (a provider's error body). Defaults to the code's own
	 * wording, so most throws name nothing.
	 */
	message?: string;
	/** Overrides the code's status, for the rare failure that is not 1:1. */
	status?: number;
	/** Field-level problems, or any extra context for the client. */
	details?: unknown;
};

/**
 * The only thing the API throws on purpose. Every field is optional, and the
 * missing parts come from `ERRORS[code]`.
 *
 *   throw new AppException();                                     // 500, default text
 *   throw new AppException('NOT_FOUND');                          // 404, default text
 *   throw new AppException({ code: 'CONFLICT', message: 'That email is already registered' });
 *   throw new AppException({ code: 'BAD_REQUEST', message: provider.body });
 *
 * The filter reads `code` back out, so status and machine code cannot drift.
 */
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
