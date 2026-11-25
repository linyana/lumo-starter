import type { z } from 'zod';
import type { accountSchema } from './index';

export type Account = z.infer<typeof accountSchema>;
