import { z } from 'zod';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '../../../common/pagination';
import type { AccountSettingContent } from './types';

export const settingTypes = ['account'] as const;

export const settingTypeSchema = z.enum(settingTypes);

export const accountSettingContentSchema = z.object({
	pageSize: z.number().int().min(PAGE_SIZE_MIN).max(PAGE_SIZE_MAX),
});

export const accountSettingContentDefaults = {
	pageSize: PAGE_SIZE_DEFAULT,
} satisfies AccountSettingContent;
