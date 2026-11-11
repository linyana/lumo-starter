import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { ApiFailure, ErrorCode, FieldError } from '@lumo/shared';
import type { NodeRequest, NodeResponse } from '@nestjs/platform-node';
import { ERRORS } from '../errors/table/index.js';

/** Status → code, for exceptions thrown by Nest itself (404 on an unknown route…). */
const STATUS_TO_CODE: Record<number, ErrorCode> = {
	400: 'BAD_REQUEST',
	401: 'UNAUTHORIZED',
	403: 'FORBIDDEN',
	404: 'NOT_FOUND',
	409: 'CONFLICT',
	429: 'RATE_LIMITED',
};

/** The body a code falls back to. */
const defaultBody = ({ code, details }: { code: ErrorCode; details?: unknown }): ApiFailure => ({
	error: { code, message: ERRORS[code].message, details },
});

/** Prisma's `Pxxxx` codes that have a domain meaning. */
const PRISMA_TO_CODE: Record<string, ErrorCode> = {
	P2002: 'CONFLICT',
	P2003: 'CONFLICT',
	P2025: 'NOT_FOUND',
};

type PrismaLikeError = { code: string; meta?: unknown };

const asPrismaError = (error: unknown): PrismaLikeError | undefined => {
	if (typeof error !== 'object' || error === null) return undefined;
	const candidate = error as { code?: unknown };
	return typeof candidate.code === 'string' && /^P\d{4}$/.test(candidate.code)
		? (error as PrismaLikeError)
		: undefined;
};

/**
 * One response shape for every failure: `{ error: { code, message, details } }`.
 * Anything unexpected is logged with its stack and reported as INTERNAL — no
 * driver or ORM message ever reaches the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<NodeResponse>();
		const request = ctx.getRequest<NodeRequest>();

		const { status, body } = this.describe(exception);

		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(
				`${request.method} ${request.url} -> ${status} [${body.error.code}]`,
				exception instanceof Error ? exception.stack : String(exception),
			);
		}

		response.status(status).json(body);
	}

	private describe(exception: unknown): { status: number; body: ApiFailure } {
		if (exception instanceof HttpException) {
			return this.fromHttpException(exception);
		}

		const prismaError = asPrismaError(exception);
		if (prismaError) {
			const code = PRISMA_TO_CODE[prismaError.code] ?? 'INTERNAL';
			return {
				status: ERRORS[code].status,
				body: defaultBody({ code, details: prismaError.meta }),
			};
		}

		return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: defaultBody({ code: 'INTERNAL' }) };
	}

	private fromHttpException(exception: HttpException): { status: number; body: ApiFailure } {
		const status = exception.getStatus();
		const payload = exception.getResponse();
		const record =
			typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {};

		const code = (record.code as ErrorCode | undefined) ?? STATUS_TO_CODE[status] ?? 'INTERNAL';

		return {
			status,
			body: {
				error: {
					code,
					message: this.readMessage({ raw: record.message ?? record.error, code }),
					details: record.details as FieldError[] | undefined,
				},
			},
		};
	}

	/** `AppException` sends a sentence; Nest's own exceptions may send an array. */
	private readMessage({ raw, code }: { raw: unknown; code: ErrorCode }): string {
		if (typeof raw === 'string' && raw.length > 0) return raw;
		if (Array.isArray(raw) && raw.every((item) => typeof item === 'string')) {
			return raw.join('; ');
		}
		return ERRORS[code].message;
	}
}
