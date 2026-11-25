import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema, usernameSchema } from '../../field';
import { permissionSchema } from '../../rbac/permission';
import { userSchema } from '../../../features/user';
import { workspaceSchema } from '../../../features/workspace';

export const registerSchema = z
	.object({
		email: emailSchema,
		username: usernameSchema,
		name: nameSchema,
		password: passwordSchema,
		confirmPassword: z.string({ error: 'Password is required' }),
	})
	.refine((value) => value.password === value.confirmPassword, {
		error: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string({ error: 'Password is required' }).min(1, { error: 'Password is required' }),
});

export const switchWorkspaceSchema = z.object({
	workspaceId: z.uuid({ error: 'Not a valid workspace id' }),
});

/**
 * What a signed-in client holds: who it is, what it may do here, and which workspaces it can reach.
 * `permissions` is resolved by the API from roles — a client never expands a role name into actions.
 */
export const sessionSchema = z.object({
	user: userSchema,
	permissions: z.array(permissionSchema),
	workspace: workspaceSchema,
	workspaces: z.array(workspaceSchema),
});

export const authResultSchema = sessionSchema.extend({
	accessToken: z.string(),
});
