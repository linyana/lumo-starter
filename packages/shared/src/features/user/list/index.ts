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
	sort: z.enum(['email', 'username', 'name', 'createdAt']).optional(),
	order: sortOrderSchema.optional(),
});
