import type { Permission } from '../permission';
import type { RoleRef } from '../role';

export type AccessGrant = {
	readonly roles: readonly RoleRef[];
	readonly permissions: readonly Permission[];
};

export type AccessCondition = {
	permission?: Permission | readonly Permission[];
	role?: string | readonly string[];
	when?: (grant: AccessGrant) => boolean;
};

export type WithAccess = { access?: AccessCondition };
