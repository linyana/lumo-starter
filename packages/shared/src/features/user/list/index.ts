import { z } from 'zod';
import { EMAIL_MAX } from '../../../common/field';
import { paginationSchema, sortOrderSchema } from '../../../common/pagination';

export const listUsersQuerySchema = paginationSchema.extend({
	search: z.string().trim().max(120, { error: 'Search must be at most 120 characters' }).optional(),
	email: z
		.string()
		.trim()
		.max(EMAIL_MAX, { error: `Email must be at most ${EMAIL_MAX} characters` })
		.optional(),
	/** No `.default()` on these two: a reader who has not picked a column sends neither, and the order a
	 * list reads in is decided where it is read — `UsersService.list` — not restated as a request field
	 * the client would have to send back. */
	sort: z.enum(['email', 'name', 'createdAt']).optional(),
	order: sortOrderSchema.optional(),
});
