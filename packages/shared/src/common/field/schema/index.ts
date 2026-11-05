import { z } from 'zod';
import { EMAIL_MAX, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants';

/**
 * Field rules are declared once and imported by both runtimes:
 *
 * - the API turns them into a `ZodValidationPipe` on the request body,
 * - the web app runs the same object in `safeParse` on submit and feeds the
 *   issues to Base UI's `<Form errors>` (see `apps/web/src/lib/form/index.ts`),
 *
 * so a rule can never drift between the two. The message is the sentence the
 * rule owns, written here because this is the one object both runtimes read.
 *
 * A rule lives with its field, not with the form that happens to show it: `auth`
 * and `user` both build on these three.
 */

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
