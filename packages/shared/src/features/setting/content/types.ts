import type { z } from 'zod';
import type { accountSettingContentSchema } from './index';

export type AccountSettingContent = z.infer<typeof accountSettingContentSchema>;
