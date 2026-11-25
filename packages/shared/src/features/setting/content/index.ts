import { z } from 'zod';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '../../../common/pagination';
import type { UserSettingContent } from './types';

export const settingTypes = ['user'] as const;

export const settingTypeSchema = z.enum(settingTypes);

export const userSettingContentSchema = z.object({
	pageSize: z.number().int().min(PAGE_SIZE_MIN).max(PAGE_SIZE_MAX),
});

export const userSettingContentDefaults = {
	pageSize: PAGE_SIZE_DEFAULT,
} satisfies UserSettingContent;
