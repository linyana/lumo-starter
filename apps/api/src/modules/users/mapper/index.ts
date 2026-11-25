import type { RoleRef, User as WireUser } from '@lumo/shared';
import type { Prisma, User as UserRow } from '../../../generated/prisma/client.js';

export const userWireSelect = {
	id: true,
	email: true,
	username: true,
	name: true,
	createdAt: true,
} as const satisfies Prisma.UserSelect;

export type UserWireRow = Pick<UserRow, 'id' | 'email' | 'username' | 'name' | 'createdAt'>;

export const toWireUser = ({
	row,
	roles,
}: {
	row: UserWireRow;
	roles: readonly RoleRef[];
}): WireUser => ({
	id: row.id,
	email: row.email,
	username: row.username,
	name: row.name,
	roles: [...roles],
	createdAt: row.createdAt.toISOString(),
});
