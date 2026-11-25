import type { z } from 'zod';
import type { SYSTEM_ROLES } from './constants';
import type { roleRefSchema } from './schema';

export type SystemRole = (typeof SYSTEM_ROLES)[number];

/** A role as the wire carries it: the key is what assignments hold, the name is what people read. */
export type RoleRef = z.infer<typeof roleRefSchema>;
