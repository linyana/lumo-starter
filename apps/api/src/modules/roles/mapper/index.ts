import type { Permission, Role as WireRole, RoleRef } from '@lumo/shared';
import type { Prisma, Role as RoleRow } from '../../../generated/prisma/client.js';
import { decodePermissions } from '../../../common/db/codec/index.js';

export const roleRefSelect = {
	key: true,
	name: true,
} as const satisfies Prisma.RoleSelect;

export type RoleRefRow = Pick<RoleRow, 'key' | 'name'>;

export const toRoleRef = (row: RoleRefRow): RoleRef => ({ key: row.key, name: row.name });

export const roleWireSelect = {
	id: true,
	key: true,
	name: true,
	system: true,
	permissions: { select: { permissionKey: true } },
} as const satisfies Prisma.RoleSelect;

export type RoleWireRow = Pick<RoleRow, 'id' | 'key' | 'name' | 'system'> & {
	permissions: { permissionKey: string }[];
};

export const toWireRole = (row: RoleWireRow): WireRole => {
	const permissions: Permission[] = decodePermissions(
		row.permissions.map((row) => row.permissionKey),
	);

	return {
		id: row.id,
		key: row.key,
		name: row.name,
		system: row.system,
		permissions,
	};
};
