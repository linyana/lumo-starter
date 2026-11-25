import { Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { updateUserSettingSchema, type UpdateUserSettingInput } from '@lumo/shared';
import { CurrentActor } from '../../common/decorators/current-user.decorator.js';
import { ZodBody } from '../../common/pipes/zod-validation.pipe.js';
import { ApiZodBody } from '../../common/swagger/zod-openapi/index.js';
import type { AuthActor } from '../../common/types/index.js';
import { SettingsService } from './settings.service.js';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
	constructor(private readonly settings: SettingsService) {}

	@Get('me')
	async mine(@CurrentActor() actor: AuthActor) {
		return { setting: await this.settings.mine(actor.id) };
	}

	@Patch('me')
	@ApiZodBody(updateUserSettingSchema)
	async updateMine(
		@CurrentActor() actor: AuthActor,
		@ZodBody(updateUserSettingSchema) input: UpdateUserSettingInput,
	) {
		return { setting: await this.settings.updateMine({ userId: actor.id, input }) };
	}
}
