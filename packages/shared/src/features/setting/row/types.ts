import type { z } from 'zod';
import type { accountSettingSchema } from './index';

export type AccountSetting = z.infer<typeof accountSettingSchema>;
