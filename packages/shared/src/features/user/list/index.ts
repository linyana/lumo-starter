import { z } from 'zod';
import { EMAIL_MAX } from '../../../common/field';
import { paginationSchema, sortOrderSchema } from '../../../common/pagination';

export const listUsersQuerySchema = paginationSchema.extend({
	search: z.string().trim().max(120, { error: 'Search must be at most 120 characters' }).optional(),
	/**
	 * The address whole, where `search` is the one that matches inside it. Any text is accepted: a
	 * half-typed address is a filter that matches nothing, not a malformed request — the column's field
	 * is written on every settled keystroke, and an error row between two of them is the table shouting
	 * at a reader who is still typing.
	 */
	email: z
		.string()
		.trim()
		.max(EMAIL_MAX, { error: `Email must be at most ${EMAIL_MAX} characters` })
		.optional(),
	sort: z.enum(['email', 'name', 'createdAt']).default('createdAt'),
	order: sortOrderSchema,
});
