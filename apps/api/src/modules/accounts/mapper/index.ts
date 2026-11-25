import type { Permission, Role, Account as WireAccount } from '@lumo/shared';
import { permissionsOf } from '@lumo/shared';
import type { Prisma, Account as AccountRow } from '../../../generated/prisma/client.js';
import { decodeRoles } from '../../../common/db/codec/index.js';

export const accountWireSelect = {
	id: true,
	email: true,
	username: true,
	name: true,
	roles: true,
	createdAt: true,
} as const satisfies Prisma.AccountSelect;

export type AccountWireRow = Pick<
	AccountRow,
	'id' | 'email' | 'username' | 'name' | 'roles' | 'createdAt'
>;

export const toWireAccount = (row: AccountWireRow): WireAccount => {
	const roles: Role[] = decodeRoles(row.roles);
	const permissions: Permission[] = permissionsOf(roles);

	return {
		id: row.id,
		email: row.email,
		username: row.username,
		name: row.name,
		roles,
		permissions,
		createdAt: row.createdAt.toISOString(),
	};
};
