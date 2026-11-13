import { permissionsOf, type Role } from '../../role';
import type { AccessCondition, AccessGrant, WithAccess } from '../types';

/** One value and a list of values are the same statement; a bare `string` cannot be indexed. */
const listOf = <T extends string>(value: T | readonly T[]): readonly T[] =>
	typeof value === 'string' ? [value as T] : value;

/** The one constructor of a grant: roles in, the permissions they carry out. */
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

/**
 * The session's half of a condition: `permission` and `role`, and never `when`.
 * What `when` says is the thing's own answer about the data — "an account cannot
 * delete itself" — so it is asked only where the data is, by `allows` below.
 *
 * A gate that decides layout rather than drawing the thing — whether a column
 * exists at all — asks this one instead, because an answer that depends on the
 * records would come and go as the records do.
 */
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

/**
 * The single answer every gate reads — the API guard, a route, a column, a menu
 * row, a button: the session's half, and then the condition's own `when` composed
 * after it, so a predicate narrows and never widens. No condition grants, so an
 * ungated item needs no branch at the call site; every stated field must hold.
 */
export const allows = ({
	condition,
	grant,
}: {
	condition?: AccessCondition;
	grant: AccessGrant;
}): boolean => permits({ condition, grant }) && (condition?.when?.(grant) ?? true);

/**
 * Drops what the grant does not allow, keeping the order and the item type — so a
 * list and a list gated by one are handed to a component the same way.
 */
export const filterAccess = <T extends WithAccess>({
	items,
	grant,
}: {
	items: readonly T[];
	grant: AccessGrant;
}): T[] => items.filter((item) => allows({ condition: item.access, grant }));
