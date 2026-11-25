import type { Permission, PermissionResource } from '../types';

export const PERMISSIONS = [
	'user:read',
	'user:write',
	'user:delete',
	'role:read',
	'role:write',
	'audit:read',
] as const;

export const PERMISSION_META = {
	'user:read': 'View members',
	'user:write': 'Invite and edit members',
	'user:delete': 'Remove members',
	'role:read': 'View roles',
	'role:write': 'Manage roles',
	'audit:read': 'Read the audit log',
} satisfies Record<Permission, string>;

export const PERMISSION_RESOURCE_META = {
	user: 'Members',
	role: 'Roles',
	audit: 'Audit log',
} satisfies Record<PermissionResource, string>;
