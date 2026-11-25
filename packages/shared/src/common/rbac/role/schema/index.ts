import { z } from 'zod';
import { SYSTEM_ROLES } from '../constants';

export const systemRoleSchema = z.enum(SYSTEM_ROLES);

/** `OWNER` for a system role, a slug for a workspace's own role. Both columns are VarChar(32). */
export const roleKeySchema = z
	.string()
	.trim()
	.min(2, { error: 'Role keys are at least 2 characters' })
	.max(32, { error: 'Role keys are at most 32 characters' });

export const roleKeyListSchema = z
	.array(roleKeySchema)
	.min(1, { error: 'At least one role is required' });

export const roleRefSchema = z.object({
	key: roleKeySchema,
	name: z.string(),
});
