import type { Permission, PermissionResource } from '../types';

export const PERMISSIONS = [
	'member:read',
	'member:write',
	'member:delete',
	'role:read',
	'role:write',
	'audit:read',
] as const;

export const PERMISSION_META = {
	'member:read': 'View members',
	'member:write': 'Invite and edit members',
	'member:delete': 'Remove members',
	'role:read': 'View roles',
	'role:write': 'Manage roles',
	'audit:read': 'Read the audit log',
} satisfies Record<Permission, string>;

export const PERMISSION_RESOURCE_META = {
	member: 'Members',
	role: 'Roles',
	audit: 'Audit log',
} satisfies Record<PermissionResource, string>;
