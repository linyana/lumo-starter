import { z } from 'zod';
import { emailSchema, nameSchema } from '../../../common/field';
import { roleListSchema } from '../../../common/rbac/role';

export const updateUserFormSchema = z.object({
	email: emailSchema,
	name: nameSchema,
	roles: roleListSchema,
});

export const updateUserSchema = updateUserFormSchema
	.partial()
	.refine((value) => Object.keys(value).length > 0, { error: 'Send at least one field to update' });
