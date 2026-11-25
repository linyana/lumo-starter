import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema, usernameSchema } from '../../../common/field';
import { roleKeyListSchema } from '../../../common/rbac/role';

export const createUserSchema = z.object({
	email: emailSchema,
	username: usernameSchema,
	name: nameSchema,
	password: passwordSchema,
	roles: roleKeyListSchema.default(['MEMBER']),
});
