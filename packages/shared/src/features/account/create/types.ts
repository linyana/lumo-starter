import type { z } from 'zod';
import type { createAccountSchema } from './index';

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
