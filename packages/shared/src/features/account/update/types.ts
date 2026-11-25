import type { z } from 'zod';
import type { updateAccountSchema } from './index';

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
