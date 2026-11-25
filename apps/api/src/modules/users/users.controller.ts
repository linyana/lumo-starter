import { Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	batchDeleteUsersSchema,
	createUserSchema,
	listUsersQuerySchema,
	updateUserSchema,
	userParamsSchema,
	type BatchDeleteUsersInput,
	type CreateUserInput,
	type ListUsersQuery,
	type UpdateUserInput,
	type UserParams,
} from '@lumo/shared';
import { CurrentActor } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { ZodBody, ZodParams, ZodQuery } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthActor } from '../../common/types/index.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly users: UsersService) {}

	@Get()
	@RequirePermissions('user:read')
	async list(
		@ZodQuery(listUsersQuerySchema) query: ListUsersQuery,
		@CurrentActor() actor: AuthActor,
	) {
		return this.users.list({ query, workspaceId: actor.workspaceId });
	}

	@Get(':id')
	@RequirePermissions('user:read')
	async get(@ZodParams(userParamsSchema) { id }: UserParams, @CurrentActor() actor: AuthActor) {
		return { user: await this.users.getById({ id, workspaceId: actor.workspaceId }) };
	}

	@Post()
	@RequirePermissions('user:write')
	@ApiZodBody(createUserSchema)
	async create(
		@ZodBody(createUserSchema) input: CreateUserInput,
		@CurrentActor() actor: AuthActor,
	) {
		return { user: await this.users.create({ actor, input }) };
	}

	@Patch(':id')
	@RequirePermissions('user:write')
	@ApiZodBody(updateUserSchema)
	async update(
		@ZodParams(userParamsSchema) { id }: UserParams,
		@ZodBody(updateUserSchema) input: UpdateUserInput,
		@CurrentActor() actor: AuthActor,
	) {
		return { user: await this.users.update({ actor, id, input }) };
	}

	@Delete(':id')
	@RequirePermissions('user:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async remove(@ZodParams(userParamsSchema) { id }: UserParams, @CurrentActor() actor: AuthActor) {
		await this.users.remove({ actor, id });
	}

	@Post('batch-delete')
	@RequirePermissions('user:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	@ApiZodBody(batchDeleteUsersSchema)
	async removeMany(
		@ZodBody(batchDeleteUsersSchema) input: BatchDeleteUsersInput,
		@CurrentActor() actor: AuthActor,
	) {
		await this.users.removeMany({ actor, ids: input.ids });
	}
}
