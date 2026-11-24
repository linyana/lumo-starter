import type { z } from 'zod';
import type { userSettingSchema } from './index';

export type UserSetting = z.infer<typeof userSettingSchema>;
