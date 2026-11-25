import type { z } from 'zod';
import type { listAccountsQuerySchema } from './index';

export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;
