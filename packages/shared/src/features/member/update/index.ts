import { z } from 'zod';
import { emailSchema, usernameSchema } from '../../../common/field';
import { roleKeyListSchema } from '../../../common/rbac/role';

export const updateMemberSchema = z.object({
	email: emailSchema,
	username: usernameSchema,
	roles: roleKeyListSchema,
});
