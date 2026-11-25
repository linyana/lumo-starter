import type { Permission } from '../../permission';
import type { RoleRef } from '../../role';
import type { AccessCondition, AccessGrant, WithAccess } from '../types';

const listOf = <T extends string>(value: T | readonly T[]): readonly T[] =>
	typeof value === 'string' ? [value as T] : value;

export const grantOf = ({
	roles = [],
	permissions = [],
}: {
	roles?: readonly RoleRef[];
	permissions?: readonly Permission[];
} = {}): AccessGrant => ({ roles, permissions });

export const hasPermission = ({
	permissions,
	required,
}: {
	permissions: readonly Permission[];
	required: Permission | readonly Permission[];
}): boolean => listOf(required).every((permission) => permissions.includes(permission));

const holdsPermission = ({
	grant,
	required,
}: {
	grant: AccessGrant;
	required: AccessCondition['permission'];
}): boolean =>
	required === undefined || hasPermission({ permissions: grant.permissions, required });

const holdsRole = ({
	grant,
	wanted,
}: {
	grant: AccessGrant;
	wanted: AccessCondition['role'];
}): boolean =>
	wanted === undefined ||
	listOf(wanted).some((key) => grant.roles.some((role) => role.key === key));

const permits = ({
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
