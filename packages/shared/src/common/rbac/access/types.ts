import type { Permission } from '../permission';
import type { Role } from '../role';

export type AccessGrant = {
	readonly roles: readonly Role[];
	readonly permissions: readonly Permission[];
};

export type AccessCondition = {
	permission?: Permission | readonly Permission[];
	role?: Role | readonly Role[];
	when?: (grant: AccessGrant) => boolean;
};

export type WithAccess = { access?: AccessCondition };
