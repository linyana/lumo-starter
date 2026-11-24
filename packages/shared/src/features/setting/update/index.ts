import { userSettingContentSchema } from '../content';

// Every field is optional: the API merges the patch into the stored content,
// so a client may send just the key it changed.
export const updateUserSettingSchema = userSettingContentSchema.partial();
