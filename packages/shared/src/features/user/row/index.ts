import { z } from 'zod';
import { permissionSchema } from '../../../common/rbac/permission';
import { roleSchema } from '../../../common/rbac/role';

export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	roles: z.array(roleSchema),
	permissions: z.array(permissionSchema),
	createdAt: z.iso.datetime(),
});
