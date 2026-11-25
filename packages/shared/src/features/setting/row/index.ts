import { z } from 'zod';
import { accountSettingContentSchema } from '../content';

export const accountSettingSchema = z.object({
	type: z.literal('account'),
	content: accountSettingContentSchema,
	updatedAt: z.iso.datetime().nullable(),
});
