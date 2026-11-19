import { z } from 'zod';
import { emailSchema, nameSchema } from '../../../common/field';
import { roleListSchema } from '../../../common/rbac/role';

/**
 * The whole of what an update may say. One editor holds every editable field, so a body naming some of
 * them is a second shape nothing sends — and the screen validates with this same object, as a create
 * does, so the rules cannot drift from the ones the API parses.
 */
export const updateUserSchema = z.object({
	email: emailSchema,
	name: nameSchema,
	roles: roleListSchema,
});
