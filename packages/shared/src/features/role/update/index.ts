import { z } from 'zod';
import { nameSchema } from '../../../common/field';
import { permissionListSchema } from '../../../common/rbac/permission';
import { memberEditorRule } from '../rule';

export const updateRoleSchema = z
	.object({
		name: nameSchema,
		permissions: permissionListSchema,
	})
	.refine(memberEditorRule.holds, memberEditorRule.error);
