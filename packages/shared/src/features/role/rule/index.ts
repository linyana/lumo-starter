import type { Permission } from '../../../common/rbac/permission';

/**
 * The member editor loads the role list it assigns from `GET /roles`. A role that may edit members but
 * may not read roles would open a form with an empty picker, so the pair is validated here rather than
 * discovered by whoever builds such a role first.
 */
export const memberEditorRule = {
	holds: (value: { permissions: readonly Permission[] }): boolean =>
		!value.permissions.includes('user:write') || value.permissions.includes('role:read'),
	error: {
		error: 'Editing members needs "View roles" too, so the editor can list what it assigns',
		path: ['permissions'],
	},
};
