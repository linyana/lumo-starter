import type { z } from 'zod';
import type { listMembersQuerySchema } from './index';

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;
