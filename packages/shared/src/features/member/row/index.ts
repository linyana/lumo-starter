import { z } from 'zod';
import { roleRefSchema } from '../../../common/rbac/role';

export const memberSchema = z.object({
	id: z.string(),
	email: z.string(),
	username: z.string(),
	roles: z.array(roleRefSchema),
	createdAt: z.iso.datetime(),
});
