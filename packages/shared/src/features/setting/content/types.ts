import type { z } from 'zod';
import type { userSettingContentSchema } from './index';

export type UserSettingContent = z.infer<typeof userSettingContentSchema>;
