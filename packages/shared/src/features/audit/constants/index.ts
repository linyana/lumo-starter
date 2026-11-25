import type { AuditAction } from '../types';

export const AUDIT_ACTIONS = [
	'member.added',
	'member.roles_changed',
	'member.removed',
	'role.created',
	'role.updated',
	'role.deleted',
] as const;

export const AUDIT_ACTION_META = {
	'member.added': 'Member added',
	'member.roles_changed': 'Roles changed',
	'member.removed': 'Member removed',
	'role.created': 'Role created',
	'role.updated': 'Role changed',
	'role.deleted': 'Role deleted',
} satisfies Record<AuditAction, string>;
