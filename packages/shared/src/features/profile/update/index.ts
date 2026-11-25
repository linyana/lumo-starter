import { z } from 'zod';
import { emailSchema, usernameSchema } from '../../../common/field';

export const updateProfileSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
});

export const patchProfileSchema = updateProfileSchema.partial();
