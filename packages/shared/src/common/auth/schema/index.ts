import { z } from 'zod';
import { emailSchema, nameSchema, passwordSchema, usernameSchema } from '../../field';
import { accountSchema } from '../../../features/account';

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

export const authResultSchema = z.object({
	accessToken: z.string(),
	account: accountSchema,
});
