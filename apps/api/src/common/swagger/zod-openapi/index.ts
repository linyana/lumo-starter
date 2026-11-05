import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, type SchemaObject } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';

/**
 * zod 4 can describe itself as JSON Schema, so Swagger needs no
 * class-validator/class-transformer DTOs and no duplicated decorators.
 *
 * `io: 'input'` documents what the endpoint accepts (before `.default()` and
 * transforms), which is what a client has to send.
 */
export const zodToSchema = (schema: ZodType): SchemaObject =>
	z.toJSONSchema(schema, {
		io: 'input',
		target: 'draft-7',
		// Transforms (.trim(), .toLowerCase()) cannot be expressed in JSON Schema;
		// document the underlying shape instead of failing the whole document.
		unrepresentable: 'any',
	}) as SchemaObject;

export const ApiZodBody = (schema: ZodType): MethodDecorator =>
	applyDecorators(ApiBody({ schema: zodToSchema(schema) }));

export const ApiZodOk = (schema: ZodType): MethodDecorator =>
	applyDecorators(ApiOkResponse({ schema: zodToSchema(schema) }));
