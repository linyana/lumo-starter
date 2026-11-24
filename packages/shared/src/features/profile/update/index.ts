import { z } from 'zod';
import { emailSchema, nameSchema, usernameSchema } from '../../../common/field';

export const updateProfileSchema = z.object({
	username: usernameSchema,
	email: emailSchema,
	name: nameSchema,
});

// The form validates the whole profile; the wire only carries what changed.
export const patchProfileSchema = updateProfileSchema.partial();
