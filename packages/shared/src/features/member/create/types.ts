import type { z } from 'zod';
import type { createMemberSchema } from './index';

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
