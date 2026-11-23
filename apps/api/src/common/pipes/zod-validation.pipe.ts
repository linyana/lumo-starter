import { Body, Param, type PipeTransform, Query } from '@nestjs/common';
import type { FieldError } from '@lumo/shared';
import type { ZodType } from 'zod';
import { AppException } from '../errors/app.exception.js';

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

export const ZodBody = <T>(schema: ZodType<T>): ParameterDecorator =>
	Body(new ZodValidationPipe(schema));

export const ZodParams = <T>(schema: ZodType<T>): ParameterDecorator =>
	Param(new ZodValidationPipe(schema));

export const ZodQuery = <T>(schema: ZodType<T>): ParameterDecorator =>
	Query(new ZodValidationPipe(schema));
