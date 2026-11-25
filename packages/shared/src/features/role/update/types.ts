import type { z } from 'zod';
import type { updateRoleSchema } from './index';

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
