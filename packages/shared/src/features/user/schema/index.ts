import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from '../../../common/field';
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

/**
 * An account made by someone else, so the password is the one they are handed and not one they
 * chose: the same rules as a sign-up, without the confirmation the typewriter needed.
 */
export const createUserSchema = z.object({
	email: emailSchema,
	name: nameSchema,
	password: passwordSchema,
	roles: z.array(roleSchema).min(1).default(['MEMBER']),
});

export const updateUserSchema = z
	.object({
		email: emailSchema.optional(),
		name: nameSchema.optional(),
		roles: z.array(roleSchema).min(1).optional(),
	})
	.refine((value) => Object.keys(value).length > 0, { error: 'Send at least one field to update' });

export const listUsersQuerySchema = paginationSchema.extend({
	search: z.string().trim().max(120).optional(),
	sort: z.enum(['email', 'name', 'createdAt']).default('createdAt'),
	order: sortOrderSchema,
});
