import type { z } from 'zod';
import type { patchProfileSchema, updateProfileSchema } from './index';

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type PatchProfileInput = z.infer<typeof patchProfileSchema>;
