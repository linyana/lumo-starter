import { z } from 'zod';
import { emailSchema, nameSchema, usernameSchema } from '../../../common/field';
import { roleKeyListSchema } from '../../../common/rbac/role';

export const updateUserSchema = z.object({
	email: emailSchema,
	username: usernameSchema,
	name: nameSchema,
	roles: roleKeyListSchema,
});
