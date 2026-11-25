import type { z } from 'zod';
import type { SYSTEM_ROLES } from './constants';
import type { roleRefSchema } from './schema';

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export type RoleRef = z.infer<typeof roleRefSchema>;
