import { z } from 'zod';
import { permissionSchema } from '../../../common/rbac/permission';
import { roleKeySchema } from '../../../common/rbac/role';

export const roleSchema = z.object({
	id: z.string(),
	key: roleKeySchema,
	name: z.string(),
	description: z.string(),
	system: z.boolean(),
	permissions: z.array(permissionSchema),
});
