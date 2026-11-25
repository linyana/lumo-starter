import {
	userSettingContentDefaults,
	userSettingContentSchema,
	type UserSetting,
	type UserSettingContent,
} from '@lumo/shared';
import type { Setting as SettingRow } from '../../../generated/prisma/client.js';

export const storedContent = (content: unknown): Partial<UserSettingContent> => {
	const parsed = userSettingContentSchema.partial().safeParse(content);
	return parsed.success ? parsed.data : {};
};

export const toWireUserSetting = (
	row: Pick<SettingRow, 'content' | 'updatedAt'> | null,
): UserSetting => ({
	type: 'user',
	content: { ...userSettingContentDefaults, ...storedContent(row?.content) },
	updatedAt: row?.updatedAt.toISOString() ?? null,
});
