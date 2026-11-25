import type { z } from 'zod';
import type { updateAccountSettingSchema } from './index';

export type UpdateAccountSettingInput = z.infer<typeof updateAccountSettingSchema>;
