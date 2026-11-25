import { z } from 'zod';
import { DESCRIPTION_MAX, nameSchema } from '../../../common/field';
import { permissionListSchema } from '../../../common/rbac/permission';

export const updateRoleSchema = z.object({
	name: nameSchema,
	description: z
		.string()
		.trim()
		.max(DESCRIPTION_MAX, { error: `Description must be at most ${DESCRIPTION_MAX} characters` })
		.default(''),
	permissions: permissionListSchema,
});
