import {
	accountSettingContentDefaults,
	accountSettingContentSchema,
	type AccountSetting,
	type AccountSettingContent,
} from '@lumo/shared';
import type { Setting as SettingRow } from '../../../generated/prisma/client.js';

export const storedContent = (content: unknown): Partial<AccountSettingContent> => {
	const parsed = accountSettingContentSchema.partial().safeParse(content);
	return parsed.success ? parsed.data : {};
};

export const toWireAccountSetting = (
	row: Pick<SettingRow, 'content' | 'updatedAt'> | null,
): AccountSetting => ({
	type: 'account',
	content: { ...accountSettingContentDefaults, ...storedContent(row?.content) },
	updatedAt: row?.updatedAt.toISOString() ?? null,
});
