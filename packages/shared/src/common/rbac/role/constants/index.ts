import { PERMISSIONS, type Permission } from '../../permission';
import type { Role } from '../types';

/**
 * Roles are coarse buckets; permissions are the only thing guards check.
 * The mapping lives in code so the frontend can hide a button with the exact
 * same rule the backend enforces.
 */
export const ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;

export const ROLE_META = {
	OWNER: 'Owner',
	ADMIN: 'Admin',
	MEMBER: 'Member',
} satisfies Record<Role, string>;

export const ROLE_PERMISSIONS = {
	OWNER: PERMISSIONS,
	ADMIN: ['user:read', 'user:write'],
	MEMBER: ['user:read'],
} satisfies Record<Role, readonly Permission[]>;
