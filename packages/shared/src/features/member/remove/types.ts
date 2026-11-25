import type { z } from 'zod';
import type { batchDeleteMembersSchema } from './index';

export type BatchDeleteMembersInput = z.infer<typeof batchDeleteMembersSchema>;
