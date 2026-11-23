import { z } from 'zod';
import { EMAIL_MAX, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants';

export const emailSchema = z
	.string({ error: 'Email is required' })
	.trim()
	.toLowerCase()
	.max(EMAIL_MAX, { error: `Email must be at most ${EMAIL_MAX} characters` })
	.pipe(z.email({ error: 'Enter a valid email address' }));

export const passwordSchema = z
	.string({ error: 'Password is required' })
	.min(PASSWORD_MIN, { error: `Password must be at least ${PASSWORD_MIN} characters` })
	.max(PASSWORD_MAX, { error: `Password must be at most ${PASSWORD_MAX} characters` })
	.refine((value) => /[a-z]/i.test(value) && /\d/.test(value), {
		error: 'Password must mix letters and numbers',
	});

export const nameSchema = z
	.string({ error: 'Name is required' })
	.trim()
	.min(1, { error: 'Name is required' })
	.max(NAME_MAX, { error: `Name must be at most ${NAME_MAX} characters` });
