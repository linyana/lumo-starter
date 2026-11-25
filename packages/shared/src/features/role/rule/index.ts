import type { Permission } from '../../../common/rbac/permission';

export const memberEditorRule = {
	holds: (value: { permissions: readonly Permission[] }): boolean =>
		!value.permissions.includes('member:write') || value.permissions.includes('role:read'),
	error: {
		error: 'Editing members needs "View roles" too, so the editor can list what it assigns',
		path: ['permissions'],
	},
};
