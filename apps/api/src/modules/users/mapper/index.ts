import type { Permission, Role, User as WireUser } from '@lumo/shared';
import { permissionsOf } from '@lumo/shared';
import type { Prisma, User as UserRow } from '../../../generated/prisma/client.js';
import { decodeRoles } from '../../../common/db/codec/index.js';

export const userWireSelect = {
	id: true,
	email: true,
	name: true,
	roles: true,
	createdAt: true,
} as const satisfies Prisma.UserSelect;

export type UserWireRow = Pick<UserRow, 'id' | 'email' | 'name' | 'roles' | 'createdAt'>;

export const toWireUser = (row: UserWireRow): WireUser => {
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
