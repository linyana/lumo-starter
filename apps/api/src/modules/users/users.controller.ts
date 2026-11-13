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
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { ZodBody, ZodParams, ZodQuery } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthUser } from '../../common/types/index.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly users: UsersService) {}

	@Get()
	@RequirePermissions('user:read')
	async list(@ZodQuery(listUsersQuerySchema) query: ListUsersQuery) {
		return this.users.list(query);
	}

	@Get(':id')
	@RequirePermissions('user:read')
	async get(@ZodParams(userParamsSchema) { id }: UserParams) {
		return { user: await this.users.getById(id) };
	}

	@Post()
	@RequirePermissions('user:write')
	@ApiZodBody(createUserSchema)
	async create(@ZodBody(createUserSchema) input: CreateUserInput) {
		return { user: await this.users.create(input) };
	}

	@Patch(':id')
	@RequirePermissions('user:write')
	@ApiZodBody(updateUserSchema)
	async update(
		@ZodParams(userParamsSchema) { id }: UserParams,
		@ZodBody(updateUserSchema) input: UpdateUserInput,
		@CurrentUser() actor: AuthUser,
	) {
		return { user: await this.users.update({ id, input, actor }) };
	}

	@Delete(':id')
	@RequirePermissions('user:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async remove(
		@ZodParams(userParamsSchema) { id }: UserParams,
		@CurrentUser() actor: AuthUser,
	): Promise<void> {
		await this.users.remove({ id, actor });
	}

	/**
	 * The same delete asked for a screenful: every row is asked about first and they are removed in one
	 * statement, so a failure leaves nothing gone and the answer counts what did.
	 */
	@Post('batch-delete')
	@RequirePermissions('user:delete')
	@ApiZodBody(batchDeleteUsersSchema)
	async removeMany(
		@ZodBody(batchDeleteUsersSchema) input: BatchDeleteUsersInput,
		@CurrentUser() actor: AuthUser,
	) {
		return this.users.removeMany({ ids: input.ids, actor });
	}
}
