import type { Permission } from '../types';

export const PERMISSIONS = ['user:read', 'user:write', 'user:delete'] as const;

export const PERMISSION_META = {
	'user:read': 'View users',
	'user:write': 'Edit users',
	'user:delete': 'Delete users',
} satisfies Record<Permission, string>;
