import { z } from 'zod';
import { nameSchema } from '../../../common/field';
import { paginationSchema, sortOrderSchema } from '../../../common/pagination';
import { permissionSchema } from '../../../common/rbac/permission';
import { roleSchema } from '../../../common/rbac/role';

/**
 * The wire shape. Roles and permissions are zod enums derived from the same
 * arrays the guards use, so an unknown value fails to parse instead of leaking
 * into the UI as `string`.
 */
export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	roles: z.array(roleSchema),
	permissions: z.array(permissionSchema),
	createdAt: z.iso.datetime(),
});

export const updateUserSchema = z
	.object({
		name: nameSchema.optional(),
		roles: z.array(roleSchema).min(1).optional(),
	})
	.refine((value) => Object.keys(value).length > 0, { error: 'Send at least one field to update' });

export const listUsersQuerySchema = paginationSchema.extend({
	search: z.string().trim().max(120).optional(),
	sort: z.enum(['email', 'name', 'createdAt']).default('createdAt'),
	order: sortOrderSchema,
});
