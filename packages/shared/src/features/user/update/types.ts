import type { z } from 'zod';
import type { updateUserSchema } from './index';

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
