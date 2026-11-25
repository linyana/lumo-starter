import { accountSettingContentDefaults, accountSettingContentSchema } from '@lumo/shared';
import { Injectable } from '@nestjs/common';
import type {
	UpdateAccountSettingInput,
	AccountSetting,
	AccountSettingContent,
} from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { storedContent, toWireAccountSetting } from './mapper/index.js';

const scopeOf = (accountId: string): Prisma.SettingWhereUniqueInput => ({
	type_ownerId: { type: 'account', ownerId: accountId },
});

@Injectable()
export class SettingsService {
	constructor(private readonly prisma: PrismaService) {}

	async mine(accountId: string): Promise<AccountSetting> {
		const row = await this.prisma.setting.findUnique({ where: scopeOf(accountId) });
		return toWireAccountSetting(row);
	}

	async updateMine({
		accountId,
		input,
	}: {
		accountId: string;
		input: UpdateAccountSettingInput;
	}): Promise<AccountSetting> {
		const where = scopeOf(accountId);

		const current = await this.prisma.setting.findUnique({ where });
		const content: AccountSettingContent = accountSettingContentSchema.parse({
			...accountSettingContentDefaults,
			...storedContent(current?.content),
			...input,
		});

		const row = await this.prisma.setting.upsert({
			where,
			create: { type: 'account', ownerId: accountId, content },
			update: { content },
		});

		return toWireAccountSetting(row);
	}
}
