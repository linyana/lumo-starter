import type { z } from 'zod';
import type { memberParamsSchema } from './index';

export type MemberParams = z.infer<typeof memberParamsSchema>;
