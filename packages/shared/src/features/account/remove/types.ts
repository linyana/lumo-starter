import type { z } from 'zod';
import type { batchDeleteAccountsSchema } from './index';

export type BatchDeleteAccountsInput = z.infer<typeof batchDeleteAccountsSchema>;
