import { z } from 'zod';
import { emailSchema, nameSchema, usernameSchema } from '../../../common/field';

export const updateProfileSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	name: nameSchema,
});

export const patchProfileSchema = updateProfileSchema.partial();
