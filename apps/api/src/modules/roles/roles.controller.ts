import { Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	createRoleSchema,
	roleParamsSchema,
	updateRoleSchema,
	type CreateRoleInput,
	type RoleParams,
	type UpdateRoleInput,
} from '@lumo/shared';
import { CurrentActor } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { ZodBody, ZodParams } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthActor } from '../../common/types/index.js';
import { RolesService } from './roles.service.js';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
	constructor(private readonly roles: RolesService) {}

	@Get()
	@RequirePermissions('role:read')
	async list(@CurrentActor() actor: AuthActor) {
		return { roles: await this.roles.list({ workspaceId: actor.workspaceId }) };
	}

	@Get(':id')
	@RequirePermissions('role:read')
	async get(@CurrentActor() actor: AuthActor, @ZodParams(roleParamsSchema) { id }: RoleParams) {
		return { role: await this.roles.findById({ workspaceId: actor.workspaceId, id }) };
	}

	@Post()
	@RequirePermissions('role:write')
	@ApiZodBody(createRoleSchema)
	async create(
		@CurrentActor() actor: AuthActor,
		@ZodBody(createRoleSchema) input: CreateRoleInput,
	) {
		return { role: await this.roles.create({ actor, input }) };
	}

	@Patch(':id')
	@RequirePermissions('role:write')
	@ApiZodBody(updateRoleSchema)
	async update(
		@CurrentActor() actor: AuthActor,
		@ZodParams(roleParamsSchema) { id }: RoleParams,
		@ZodBody(updateRoleSchema) input: UpdateRoleInput,
	) {
		return { role: await this.roles.update({ actor, id, input }) };
	}

	@Delete(':id')
	@RequirePermissions('role:write')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async remove(@CurrentActor() actor: AuthActor, @ZodParams(roleParamsSchema) { id }: RoleParams) {
		await this.roles.remove({ actor, id });
	}
}
