import type { z } from 'zod';
import type { createRoleSchema } from './index';

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
