import type { z } from 'zod';
import type { paginationSchema, sortOrderSchema } from './schema';

export type Pagination = z.infer<typeof paginationSchema>;

/** Which way a sorted list reads. The one word the API, the screens and the table all use. */
export type SortOrder = z.infer<typeof sortOrderSchema>;
