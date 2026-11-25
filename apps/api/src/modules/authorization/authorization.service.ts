import { Injectable } from '@nestjs/common';
import type { AccessGrant, RoleRef } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { decodePermissions } from '../../common/db/codec/index.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import type { AuthActor } from '../../common/types/index.js';
import { toRoleRef } from '../roles/mapper/index.js';

const roleWithPermissions = {
	id: true,
	key: true,
	name: true,
	permissions: { select: { permissionKey: true } },
} as const satisfies Prisma.RoleSelect;

const actorSelect = {
	id: true,
	user: { select: { id: true, email: true, username: true, name: true, createdAt: true } },
	assignments: { select: { role: { select: roleWithPermissions } } },
} as const satisfies Prisma.MembershipSelect;

type AssignedRole = Pick<
	Prisma.RoleGetPayload<{ select: typeof roleWithPermissions }>,
	'permissions'
> & {
	key: string;
	name: string;
};

const grantFrom = (roles: readonly AssignedRole[]): AccessGrant => ({
	roles: roles.map(toRoleRef),
	permissions: decodePermissions(
		roles.flatMap((role) => role.permissions.map((row) => row.permissionKey)),
	),
});

/**
 * The single place that answers "what may this actor do here". Guards check route permissions with it,
 * services check invariants with it, and the session payload is built from it — nothing anywhere else
 * expands a role into a set of actions.
 */
@Injectable()
export class AuthorizationService {
	constructor(private readonly prisma: PrismaService) {}

	async resolveActor({
		userId,
		workspaceId,
	}: {
		userId: string;
		workspaceId: string;
	}): Promise<AuthActor | null> {
		const membership = await this.prisma.membership.findUnique({
			where: { userId_workspaceId: { userId, workspaceId } },
			select: actorSelect,
		});
		if (!membership) return null;

		const grant = grantFrom(membership.assignments.map((assignment) => assignment.role));

		return {
			...membership.user,
			workspaceId,
			membershipId: membership.id,
			roles: [...grant.roles],
			permissions: [...grant.permissions],
		};
	}

	async grantOf({ membershipId }: { membershipId: string }): Promise<AccessGrant> {
		const assignments = await this.prisma.roleAssignment.findMany({
			where: { membershipId },
			select: { role: { select: roleWithPermissions } },
		});

		return grantFrom(assignments.map((assignment) => assignment.role));
	}

	async roleRefsOf({ membershipId }: { membershipId: string }): Promise<RoleRef[]> {
		const grant = await this.grantOf({ membershipId });
		return [...grant.roles];
	}
}
