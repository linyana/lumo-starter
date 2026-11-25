import { Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	batchDeleteAccountsSchema,
	createAccountSchema,
	listAccountsQuerySchema,
	updateAccountSchema,
	accountParamsSchema,
	type BatchDeleteAccountsInput,
	type CreateAccountInput,
	type ListAccountsQuery,
	type UpdateAccountInput,
	type AccountParams,
} from '@lumo/shared';
import { CurrentAccount } from '../../common/decorators/current-account.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';
import { ZodBody, ZodParams, ZodQuery } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthAccount } from '../../common/types/index.js';
import { AccountsService } from './accounts.service.js';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
	constructor(private readonly accounts: AccountsService) {}

	@Get()
	@RequirePermissions('account:read')
	async list(@ZodQuery(listAccountsQuerySchema) query: ListAccountsQuery) {
		return this.accounts.list(query);
	}

	@Get(':id')
	@RequirePermissions('account:read')
	async get(@ZodParams(accountParamsSchema) { id }: AccountParams) {
		return { account: await this.accounts.getById(id) };
	}

	@Post()
	@RequirePermissions('account:write')
	@ApiZodBody(createAccountSchema)
	async create(@ZodBody(createAccountSchema) input: CreateAccountInput) {
		return { account: await this.accounts.create(input) };
	}

	@Patch(':id')
	@RequirePermissions('account:write')
	@ApiZodBody(updateAccountSchema)
	async update(
		@ZodParams(accountParamsSchema) { id }: AccountParams,
		@ZodBody(updateAccountSchema) input: UpdateAccountInput,
		@CurrentAccount() actor: AuthAccount,
	) {
		return { account: await this.accounts.update({ id, input, actor }) };
	}

	@Delete(':id')
	@RequirePermissions('account:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	async remove(@ZodParams(accountParamsSchema) { id }: AccountParams): Promise<void> {
		await this.accounts.remove({ id });
	}

	@Post('batch-delete')
	@RequirePermissions('account:delete')
	@HttpCode(HttpStatus.NO_CONTENT)
	@SkipEnvelope()
	@ApiZodBody(batchDeleteAccountsSchema)
	async removeMany(
		@ZodBody(batchDeleteAccountsSchema) input: BatchDeleteAccountsInput,
	): Promise<void> {
		await this.accounts.removeMany({ ids: input.ids });
	}
}
