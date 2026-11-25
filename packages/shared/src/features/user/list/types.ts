import type { z } from 'zod';
import type { listUsersQuerySchema } from './index';

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
