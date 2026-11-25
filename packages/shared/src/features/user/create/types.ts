import type { z } from 'zod';
import type { createUserSchema } from './index';

export type CreateUserInput = z.infer<typeof createUserSchema>;
