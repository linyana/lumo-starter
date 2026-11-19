import type { z } from 'zod';
import type { batchDeleteUsersSchema } from './index';

export type BatchDeleteUsersInput = z.infer<typeof batchDeleteUsersSchema>;
