import type { z } from 'zod';
import type { memberSchema } from './index';

export type Member = z.infer<typeof memberSchema>;
