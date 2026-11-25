import type { Permission } from '../types';

export const PERMISSIONS = ['account:read', 'account:write', 'account:delete'] as const;

export const PERMISSION_META = {
	'account:read': 'View accounts',
	'account:write': 'Edit accounts',
	'account:delete': 'Delete accounts',
} satisfies Record<Permission, string>;
