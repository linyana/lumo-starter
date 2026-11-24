import { userSettingContentDefaults, userSettingContentSchema } from '@lumo/shared';
import { Injectable } from '@nestjs/common';
import type { UpdateUserSettingInput, UserSetting, UserSettingContent } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { storedContent, toWireUserSetting } from './mapper/index.js';

const scopeOf = (userId: string): Prisma.SettingWhereUniqueInput => ({
	type_ownerId: { type: 'user', ownerId: userId },
});

@Injectable()
export class SettingsService {
	constructor(private readonly prisma: PrismaService) {}

	async mine(userId: string): Promise<UserSetting> {
		const row = await this.prisma.setting.findUnique({ where: scopeOf(userId) });
		return toWireUserSetting(row);
	}

	async updateMine({
		userId,
		input,
	}: {
		userId: string;
		input: UpdateUserSettingInput;
	}): Promise<UserSetting> {
		const where = scopeOf(userId);

		// A patch is merged over what is already stored, so a client can send one
		// key without dropping the rest of the content.
		const current = await this.prisma.setting.findUnique({ where });
		const content: UserSettingContent = userSettingContentSchema.parse({
			...userSettingContentDefaults,
			...storedContent(current?.content),
			...input,
		});

		const row = await this.prisma.setting.upsert({
			where,
			create: { type: 'user', ownerId: userId, content },
			update: { content },
		});

		return toWireUserSetting(row);
	}
}
