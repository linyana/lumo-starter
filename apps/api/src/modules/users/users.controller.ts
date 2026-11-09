import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	listUsersQuerySchema,
	updateUserSchema,
	type ListUsersQuery,
	type UpdateUserInput,
} from '@lumo/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { ZodBody, ZodQuery } from '../../common/pipes/zod-validation.pipe.js';
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
	async get(@Param('id') id: string) {
		return { user: await this.users.getById(id) };
	}

	@Patch(':id')
	@RequirePermissions('user:write')
	@ApiZodBody(updateUserSchema)
	async update(
		@Param('id') id: string,
		@ZodBody(updateUserSchema) input: UpdateUserInput,
		@CurrentUser() actor: AuthUser,
	) {
		return { user: await this.users.update(id, input, actor) };
	}

	@Delete(':id')
	@RequirePermissions('user:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async remove(@Param('id') id: string, @CurrentUser() actor: AuthUser): Promise<void> {
		await this.users.remove(id, actor);
	}
}
