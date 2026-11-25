import type { Permission } from '../../permission';
import { PERMISSIONS } from '../../permission';
import type { SystemRole } from '../types';

/**
 * Roles that belong to the code: one row per key is seeded into `roles` with `system = true`, and the
 * API refuses to edit or delete them. Everything else is a workspace's own role, created at runtime.
 */
export const SYSTEM_ROLES = ['OWNER', 'MEMBER'] as const;

export const SYSTEM_ROLE_META = {
	OWNER: 'Owner',
	MEMBER: 'Member',
} satisfies Record<SystemRole, string>;

export const SYSTEM_ROLE_PERMISSIONS = {
	OWNER: PERMISSIONS,
	MEMBER: ['user:read'],
} satisfies Record<SystemRole, readonly Permission[]>;
