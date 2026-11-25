import type { Member as WireMember, RoleRef } from '@lumo/shared';
import type { Prisma, User as UserRow } from '../../../generated/prisma/client.js';

export const memberWireSelect = {
	id: true,
	email: true,
	username: true,
	createdAt: true,
} as const satisfies Prisma.UserSelect;

export type MemberWireRow = Pick<UserRow, 'id' | 'email' | 'username' | 'createdAt'>;

export const toWireMember = ({
	row,
	roles,
}: {
	row: MemberWireRow;
	roles: readonly RoleRef[];
}): WireMember => ({
	id: row.id,
	email: row.email,
	username: row.username,
	roles: [...roles],
	createdAt: row.createdAt.toISOString(),
});
