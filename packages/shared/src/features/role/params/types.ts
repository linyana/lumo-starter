import type { z } from 'zod';
import type { roleParamsSchema } from './index';

export type RoleParams = z.infer<typeof roleParamsSchema>;
