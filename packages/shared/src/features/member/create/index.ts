import { z } from 'zod';
import { emailSchema, passwordSchema, usernameSchema } from '../../../common/field';
import { roleKeyListSchema } from '../../../common/rbac/role';

export const createMemberSchema = z.object({
	email: emailSchema,
	username: usernameSchema,
	password: passwordSchema,
	roles: roleKeyListSchema.default(['MEMBER']),
});
