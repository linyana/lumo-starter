import type { z } from 'zod';
import type { updateUserSettingSchema } from './index';

export type UpdateUserSettingInput = z.infer<typeof updateUserSettingSchema>;
