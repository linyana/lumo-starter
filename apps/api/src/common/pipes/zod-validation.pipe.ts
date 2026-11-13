import { Body, Param, type PipeTransform, Query } from '@nestjs/common';
import type { FieldError } from '@lumo/shared';
import type { ZodType } from 'zod';
import { AppException } from '../errors/app.exception.js';

/**
 * Turns a shared zod schema into a Nest pipe, so the request body is validated
 * by the exact same object the browser form uses.
 *
 * Issue messages are the message keys the schema carries; the exception filter
 * translates them and ships the field paths alongside, so a client can point at
 * the offending input.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
	constructor(private readonly schema: ZodType<T>) {}

	transform(value: unknown): T {
		const result = this.schema.safeParse(value);
		if (result.success) return result.data;

		const details: FieldError[] = result.error.issues.map((issue) => ({
			path: issue.path.join('.') || '(root)',
			message: issue.message,
		}));

		throw new AppException({ code: 'VALIDATION_FAILED', details });
	}
}

/** `@ZodBody(schema) input: MyInput` */
export const ZodBody = <T>(schema: ZodType<T>): ParameterDecorator =>
	Body(new ZodValidationPipe(schema));

/** `@ZodParams(schema) { id }: MyParams` — a path segment arrives as text, like a query does. */
export const ZodParams = <T>(schema: ZodType<T>): ParameterDecorator =>
	Param(new ZodValidationPipe(schema));

/** `@ZodQuery(schema) query: MyQuery` — query strings arrive as text. */
export const ZodQuery = <T>(schema: ZodType<T>): ParameterDecorator =>
	Query(new ZodValidationPipe(schema));
