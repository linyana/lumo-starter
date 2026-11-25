import { Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { updateAccountSettingSchema, type UpdateAccountSettingInput } from '@lumo/shared';
import { CurrentAccount } from '../../common/decorators/current-account.decorator.js';
import { ZodBody } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthAccount } from '../../common/types/index.js';
import { SettingsService } from './settings.service.js';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
	constructor(private readonly settings: SettingsService) {}

	@Get('me')
	async mine(@CurrentAccount() account: AuthAccount) {
		return { setting: await this.settings.mine(account.id) };
	}

	@Patch('me')
	@ApiZodBody(updateAccountSettingSchema)
	async updateMine(
		@CurrentAccount() account: AuthAccount,
		@ZodBody(updateAccountSettingSchema) input: UpdateAccountSettingInput,
	) {
		return { setting: await this.settings.updateMine({ accountId: account.id, input }) };
	}
}
