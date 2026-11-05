import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema } from '../../field';
import { userSchema } from '../../../features/user';

export const registerSchema = z
	.object({
		email: emailSchema,
		name: nameSchema,
		password: passwordSchema,
		confirmPassword: z.string({ error: 'Password is required' }),
	})
	.refine((value) => value.password === value.confirmPassword, {
		error: 'Passwords do not match',
		path: ['confirmPassword'],
	});

/**
 * Sign-in must not re-apply the strength rules: tightening them later would
 * lock out every account created under the old policy.
 */
export const loginSchema = z.object({
	email: emailSchema,
	password: z.string({ error: 'Password is required' }).min(1, { error: 'Password is required' }),
});

/** Shape of a successful sign-in / register / refresh response. */
export const authResultSchema = z.object({
	accessToken: z.string(),
	user: userSchema,
});
