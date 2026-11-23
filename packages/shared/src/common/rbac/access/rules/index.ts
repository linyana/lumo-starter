import { permissionsOf, type Role } from '../../role';
import type { AccessCondition, AccessGrant, WithAccess } from '../types';

const listOf = <T extends string>(value: T | readonly T[]): readonly T[] =>
	typeof value === 'string' ? [value as T] : value;

export const grantFor = (roles: readonly Role[] = []): AccessGrant => ({
	roles,
	permissions: permissionsOf(roles),
});

const holdsPermission = ({
	grant,
	required,
}: {
	grant: AccessGrant;
	required: AccessCondition['permission'];
}): boolean =>
	required === undefined ||
	listOf(required).every((permission) => grant.permissions.includes(permission));

const holdsRole = ({
	grant,
	wanted,
}: {
	grant: AccessGrant;
	wanted: AccessCondition['role'];
}): boolean => wanted === undefined || listOf(wanted).some((role) => grant.roles.includes(role));

export const permits = ({
	condition,
	grant,
}: {
	condition?: AccessCondition;
	grant: AccessGrant;
}): boolean => {
	if (!condition) return true;
	if (!holdsPermission({ grant, required: condition.permission })) return false;
	return holdsRole({ grant, wanted: condition.role });
};

export const allows = ({
	condition,
	grant,
}: {
	condition?: AccessCondition;
	grant: AccessGrant;
}): boolean => permits({ condition, grant }) && (condition?.when?.(grant) ?? true);

export const filterAccess = <T extends WithAccess>({
	items,
	grant,
}: {
	items: readonly T[];
	grant: AccessGrant;
}): T[] => items.filter((item) => allows({ condition: item.access, grant }));
