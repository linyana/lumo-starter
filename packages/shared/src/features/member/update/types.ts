import type { z } from 'zod';
import type { updateMemberSchema } from './index';

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
