import type { z } from 'zod';
import type { roleSchema } from './index';

export type Role = z.infer<typeof roleSchema>;
