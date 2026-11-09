import type { z } from 'zod';
import type { paginationSchema } from './schema';

export type Pagination = z.infer<typeof paginationSchema>;
