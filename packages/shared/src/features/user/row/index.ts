import { z } from 'zod';
import { roleRefSchema } from '../../../common/rbac/role';

export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	username: z.string(),
	roles: z.array(roleRefSchema),
	createdAt: z.iso.datetime(),
});
