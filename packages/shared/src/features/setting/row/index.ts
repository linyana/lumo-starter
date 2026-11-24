import { z } from 'zod';
import { userSettingContentSchema } from '../content';

export const userSettingSchema = z.object({
	type: z.literal('user'),
	content: userSettingContentSchema,
	updatedAt: z.iso.datetime().nullable(),
});
