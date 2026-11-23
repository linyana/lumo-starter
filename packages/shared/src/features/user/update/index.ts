import { z } from 'zod';
import { emailSchema, nameSchema } from '../../../common/field';
import { roleListSchema } from '../../../common/rbac/role';

export const updateUserSchema = z.object({
	email: emailSchema,
	name: nameSchema,
	roles: roleListSchema,
});
