import { PERMISSIONS, type Permission } from '../../permission';
import type { Role } from '../types';

export const ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;

export const ROLE_META = {
	OWNER: 'Owner',
	ADMIN: 'Admin',
	MEMBER: 'Member',
} satisfies Record<Role, string>;

export const ROLE_PERMISSIONS = {
	OWNER: PERMISSIONS,
	ADMIN: ['account:read', 'account:write'],
	MEMBER: ['account:read'],
} satisfies Record<Role, readonly Permission[]>;
