import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from '../../../common/field';
import { roleListSchema } from '../../../common/rbac/role';

export const createUserSchema = z.object({
	email: emailSchema,
	name: nameSchema,
	password: passwordSchema,
	roles: roleListSchema.default(['MEMBER']),
});
