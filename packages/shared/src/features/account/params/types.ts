import type { z } from 'zod';
import type { accountParamsSchema } from './index';

export type AccountParams = z.infer<typeof accountParamsSchema>;
