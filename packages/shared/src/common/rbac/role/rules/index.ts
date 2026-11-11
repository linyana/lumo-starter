import type { Permission } from '../../permission';
import { ROLE_PERMISSIONS } from '../constants';
import type { Role } from '../types';

/** Union of the permissions granted by any of `roles`, de-duplicated. */
export const permissionsOf = (roles: readonly Role[]): Permission[] => {
	const granted = new Set<Permission>();
	for (const role of roles) {
		for (const permission of ROLE_PERMISSIONS[role] ?? []) granted.add(permission);
	}
	return [...granted];
};

export const hasPermission = ({
	roles,
	required,
}: {
	roles: readonly Role[];
	required: Permission | readonly Permission[];
}): boolean => {
	const granted = permissionsOf(roles);
	const wanted = Array.isArray(required) ? required : [required];
	return wanted.every((permission) => granted.includes(permission));
};
