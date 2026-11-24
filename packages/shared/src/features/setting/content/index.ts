import { z } from 'zod';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '../../../common/pagination';
import type { UserSettingContent } from './types';

// A settings row is scoped by type: "user" rows are keyed by their owner.
// A site-wide scope is a new entry here plus a row whose owner is absent.
export const settingTypes = ['user'] as const;

export const settingTypeSchema = z.enum(settingTypes);

export const userSettingContentSchema = z.object({
	pageSize: z.number().int().min(PAGE_SIZE_MIN).max(PAGE_SIZE_MAX),
});

export const userSettingContentDefaults = {
	pageSize: PAGE_SIZE_DEFAULT,
} satisfies UserSettingContent;
