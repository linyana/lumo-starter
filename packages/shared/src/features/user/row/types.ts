import type { z } from 'zod';
import type { userSchema } from './index';

export type User = z.infer<typeof userSchema>;
