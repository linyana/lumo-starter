import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, type SchemaObject } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';

export const zodToSchema = (schema: ZodType): SchemaObject =>
	z.toJSONSchema(schema, {
		io: 'input',
		target: 'draft-7',
		unrepresentable: 'any',
	}) as SchemaObject;

export const ApiZodBody = (schema: ZodType): MethodDecorator =>
	applyDecorators(ApiBody({ schema: zodToSchema(schema) }));

export const ApiZodOk = (schema: ZodType): MethodDecorator =>
	applyDecorators(ApiOkResponse({ schema: zodToSchema(schema) }));
