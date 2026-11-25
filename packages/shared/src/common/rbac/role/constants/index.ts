import type { Permission } from '../../permission';
import { PERMISSIONS } from '../../permission';
import type { SystemRole } from '../types';

export const SYSTEM_ROLES = ['OWNER', 'MEMBER'] as const;

/** The role every workspace starts with: the only one assignable without `role:read`. */
export const BASE_ROLE_KEY = 'MEMBER' satisfies SystemRole;

export const SYSTEM_ROLE_META = {
	OWNER: 'Owner',
	MEMBER: 'Member',
} satisfies Record<SystemRole, string>;

export const SYSTEM_ROLE_PERMISSIONS = {
	OWNER: PERMISSIONS,
	MEMBER: ['member:read'],
} satisfies Record<SystemRole, readonly Permission[]>;
