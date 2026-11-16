import { z } from 'zod';
import { PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '../constants';

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce
		.number()
		.int()
		.min(PAGE_SIZE_MIN)
		.max(PAGE_SIZE_MAX)
		.default(PAGE_SIZE_DEFAULT),
});

export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');
