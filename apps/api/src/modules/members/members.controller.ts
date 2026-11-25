import { Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	batchDeleteMembersSchema,
	createMemberSchema,
	listMembersQuerySchema,
	memberParamsSchema,
	updateMemberSchema,
	type BatchDeleteMembersInput,
	type CreateMemberInput,
	type ListMembersQuery,
	type MemberParams,
	type UpdateMemberInput,
} from '@lumo/shared';
import { CurrentActor } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { ZodBody, ZodParams, ZodQuery } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthActor } from '../../common/types/index.js';
import { MembersService } from './members.service.js';

@ApiTags('members')
@Controller('members')
export class MembersController {
	constructor(private readonly members: MembersService) {}

	@Get()
	@RequirePermissions('member:read')
	async list(
		@ZodQuery(listMembersQuerySchema) query: ListMembersQuery,
		@CurrentActor() actor: AuthActor,
	) {
		return this.members.list({ query, workspaceId: actor.workspaceId });
	}

	@Get('assignable-roles')
	@RequirePermissions('member:write')
	async assignableRoles(@CurrentActor() actor: AuthActor) {
		return { roles: await this.members.assignableRoles({ actor }) };
	}

	@Get(':id')
	@RequirePermissions('member:read')
	async get(@ZodParams(memberParamsSchema) { id }: MemberParams, @CurrentActor() actor: AuthActor) {
		return { member: await this.members.getById({ id, workspaceId: actor.workspaceId }) };
	}

	@Post()
	@RequirePermissions('member:write')
	@ApiZodBody(createMemberSchema)
	async create(
		@ZodBody(createMemberSchema) input: CreateMemberInput,
		@CurrentActor() actor: AuthActor,
	) {
		return { member: await this.members.create({ actor, input }) };
	}

	@Patch(':id')
	@RequirePermissions('member:write')
	@ApiZodBody(updateMemberSchema)
	async update(
		@ZodParams(memberParamsSchema) { id }: MemberParams,
		@ZodBody(updateMemberSchema) input: UpdateMemberInput,
		@CurrentActor() actor: AuthActor,
	) {
		return { member: await this.members.update({ actor, id, input }) };
	}

	@Delete(':id')
	@RequirePermissions('member:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async remove(
		@ZodParams(memberParamsSchema) { id }: MemberParams,
		@CurrentActor() actor: AuthActor,
	) {
		await this.members.remove({ actor, id });
	}

	@Post('batch-delete')
	@RequirePermissions('member:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	@ApiZodBody(batchDeleteMembersSchema)
	async removeMany(
		@ZodBody(batchDeleteMembersSchema) { ids }: BatchDeleteMembersInput,
		@CurrentActor() actor: AuthActor,
	): Promise<void> {
		await this.members.removeMany({ actor, ids });
	}
}
