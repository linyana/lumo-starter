import type { z } from 'zod';
import type { paginationSchema, sortOrderSchema } from './schema';

export type Pagination = z.infer<typeof paginationSchema>;

export type SortOrder = z.infer<typeof sortOrderSchema>;
