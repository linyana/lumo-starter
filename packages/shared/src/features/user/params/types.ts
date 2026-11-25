import type { z } from 'zod';
import type { userParamsSchema } from './index';

export type UserParams = z.infer<typeof userParamsSchema>;
