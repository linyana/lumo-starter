import { PERMISSIONS } from '../constants';
import type { Permission, PermissionResource } from '../types';

export const resourceOf = (permission: Permission): PermissionResource =>
	permission.split(':')[0] as PermissionResource;

export const groupedPermissions = (): {
	resource: PermissionResource;
	permissions: Permission[];
}[] => {
	const groups = new Map<PermissionResource, Permission[]>();
	for (const permission of PERMISSIONS) {
		const resource = resourceOf(permission);
		groups.set(resource, [...(groups.get(resource) ?? []), permission]);
	}
	return [...groups].map(([resource, permissions]) => ({ resource, permissions }));
};
