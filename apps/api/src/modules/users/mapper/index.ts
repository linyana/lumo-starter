import type { Permission, Role, User as WireUser } from '@lumo/shared';
import { permissionsOf } from '@lumo/shared';
import type { User as UserRow } from '../../../generated/prisma/client.js';
import { decodeRoles } from '../../../common/db/codec/index.js';

/**
 * Row → wire shape. `roles` is decoded here (String column → union) and
 * `permissions` is expanded from the shared role table, never stored.
 */
export const toWireUser = (row: UserRow): WireUser => {
	const roles: Role[] = decodeRoles(row.roles);
	const permissions: Permission[] = permissionsOf(roles);

	return {
		id: row.id,
		email: row.email,
		name: row.name,
		roles,
		permissions,
		createdAt: row.createdAt.toISOString(),
	};
};
