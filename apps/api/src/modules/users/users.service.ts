import { Injectable } from '@nestjs/common';
import type {
	CreateUserInput,
	ListUsersQuery,
	Paginated,
	UpdateUserInput,
	User as WireUser,
} from '@lumo/shared';
import argon2 from 'argon2';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { decodePermissions } from '../../common/db/codec/index.js';
import { assertUserFieldFree } from '../../common/db/unique/index.js';
import { AppException } from '../../common/errors/app.exception.js';
import { paginate } from '../../common/pagination/index.js';
import type { AuthActor } from '../../common/types/index.js';
import { AuditService } from '../audit/audit.service.js';
import { AssignmentGuard } from '../roles/assignments/guard.js';
import {
	lockWorkspace,
	ownersLeft,
	replaceAssignments,
	rolesByKey,
} from '../roles/assignments/index.js';
import { roleRefSelect, toRoleRef } from '../roles/mapper/index.js';
import { toWireUser, userWireSelect } from './mapper/index.js';

const membershipSelect = {
	id: true,
	user: { select: userWireSelect },
	assignments: { select: { role: { select: roleRefSelect } } },
} as const satisfies Prisma.MembershipSelect;

type MembershipWireRow = Prisma.MembershipGetPayload<{ select: typeof membershipSelect }>;

const toWireMember = (row: MembershipWireRow): WireUser =>
	toWireUser({
		row: row.user,
		roles: row.assignments.map((assignment) => toRoleRef(assignment.role)),
	});

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly audit: AuditService,
		private readonly guard: AssignmentGuard,
	) {}

	async list({
		query,
		workspaceId,
	}: {
		query: ListUsersQuery;
		workspaceId: string;
	}): Promise<Paginated<WireUser>> {
		const where: Prisma.MembershipWhereInput = {
			workspaceId,
			user: {
				email: query.email ? { contains: query.email, mode: 'insensitive' } : undefined,
				OR: query.search
					? [
							{ email: { contains: query.search, mode: 'insensitive' } },
							{ username: { contains: query.search, mode: 'insensitive' } },
							{ name: { contains: query.search, mode: 'insensitive' } },
						]
					: undefined,
			},
		};

		const orderBy = {
			user: { [query.sort ?? 'createdAt']: query.order ?? 'desc' },
		} as Prisma.MembershipOrderByWithRelationInput;

		const page = await paginate({
			prisma: this.prisma,
			query,
			find: ({ client, window }) =>
				client.membership.findMany({ where, orderBy, select: membershipSelect, ...window }),
			count: ({ client }) => client.membership.count({ where }),
		});

		return { ...page, items: page.items.map(toWireMember) };
	}

	async getById({ id, workspaceId }: { id: string; workspaceId: string }): Promise<WireUser> {
		const membership = await this.prisma.membership.findUnique({
			where: { userId_workspaceId: { userId: id, workspaceId } },
			select: membershipSelect,
		});
		if (!membership) throw new AppException('NOT_FOUND');
		return toWireMember(membership);
	}

	async create({ actor, input }: { actor: AuthActor; input: CreateUserInput }): Promise<WireUser> {
		await assertUserFieldFree({ prisma: this.prisma, field: 'email', value: input.email });
		await assertUserFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		const roles = await rolesByKey({
			client: this.prisma,
			workspaceId: actor.workspaceId,
			keys: input.roles,
		});

		this.guard.assertCanGrantPermissions({
			actor,
			permissions: decodePermissions(
				roles.flatMap((role) => role.permissions.map((row) => row.permissionKey)),
			),
		});

		const passwordHash = await argon2.hash(input.password);

		const membership = await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: {
					email: input.email,
					username: input.username,
					name: input.name,
					passwordHash,
				},
			});

			const created = await tx.membership.create({
				data: { userId: user.id, workspaceId: actor.workspaceId },
				select: { id: true },
			});

			await replaceAssignments({
				client: tx,
				membershipId: created.id,
				roleIds: roles.map((role) => role.id),
			});

			await this.audit.record({
				client: tx,
				actor,
				action: 'member.added',
				targetType: 'membership',
				targetId: created.id,
				after: { user: user.email, roles: roles.map((role) => role.key).sort() },
			});

			return tx.membership.findUniqueOrThrow({
				where: { id: created.id },
				select: membershipSelect,
			});
		});

		return toWireMember(membership);
	}

	async update({
		actor,
		id,
		input,
	}: {
		actor: AuthActor;
		id: string;
		input: UpdateUserInput;
	}): Promise<WireUser> {
		const membership = await this.prisma.membership.findUnique({
			where: { userId_workspaceId: { userId: id, workspaceId: actor.workspaceId } },
			select: membershipSelect,
		});
		if (!membership) throw new AppException('NOT_FOUND');

		const current = toWireMember(membership);

		if (input.email !== current.email)
			await assertUserFieldFree({ prisma: this.prisma, field: 'email', value: input.email });
		if (input.username !== current.username)
			await assertUserFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		const updated = await this.prisma.$transaction(async (tx) => {
			await lockWorkspace({ client: tx, workspaceId: actor.workspaceId });

			const fresh = await tx.membership.findUniqueOrThrow({
				where: { id: membership.id },
				select: membershipSelect,
			});
			const held = toWireMember(fresh).roles;

			const next = await rolesByKey({
				client: tx,
				workspaceId: actor.workspaceId,
				keys: input.roles,
			});

			await this.guard.assertCanAssign({
				actor,
				membership: { id: membership.id, roles: held },
				next,
				client: tx,
			});

			await tx.user.update({
				where: { id },
				data: { email: input.email, username: input.username, name: input.name },
			});

			await replaceAssignments({
				client: tx,
				membershipId: membership.id,
				roleIds: next.map((role) => role.id),
			});

			const before = held.map((role) => role.key).sort();
			const after = next.map((role) => role.key).sort();

			if (before.join(',') !== after.join(',')) {
				await this.audit.record({
					client: tx,
					actor,
					action: 'member.roles_changed',
					targetType: 'membership',
					targetId: membership.id,
					before: { user: current.email, roles: before },
					after: { user: current.email, roles: after },
				});
			}

			return tx.membership.findUniqueOrThrow({
				where: { id: membership.id },
				select: membershipSelect,
			});
		});

		return toWireMember(updated);
	}

	async remove({ actor, id }: { actor: AuthActor; id: string }): Promise<void> {
		await this.removeMany({ actor, ids: [id] });
	}

	async removeMany({ actor, ids }: { actor: AuthActor; ids: readonly string[] }): Promise<void> {
		const userIds = [...new Set(ids)];

		await this.prisma.$transaction(async (client) => {
			await lockWorkspace({ client, workspaceId: actor.workspaceId });

			const memberships = await client.membership.findMany({
				where: { workspaceId: actor.workspaceId, userId: { in: userIds } },
				select: {
					id: true,
					userId: true,
					user: { select: { email: true } },
					assignments: { select: { role: { select: { key: true } } } },
				},
			});

			if (memberships.length !== userIds.length) throw new AppException('NOT_FOUND');

			const owners = memberships.filter((membership) =>
				membership.assignments.some((assignment) => assignment.role.key === 'OWNER'),
			);

			if (owners.length > 0) {
				const left = await ownersLeft({ client, workspaceId: actor.workspaceId });

				if (left - owners.length < 1) {
					const self = owners.some((membership) => membership.userId === actor.id);

					throw new AppException({
						code: 'FORBIDDEN',
						message: self
							? 'You are the only owner here, so you cannot remove yourself. Give someone else Owner first.'
							: 'That is the only owner here. Give someone else Owner first, then they can be removed.',
					});
				}
			}

			await client.membership.deleteMany({
				where: { workspaceId: actor.workspaceId, userId: { in: userIds } },
			});

			for (const membership of memberships) {
				await this.audit.record({
					client,
					actor,
					action: 'member.removed',
					targetType: 'membership',
					targetId: membership.id,
					before: {
						user: membership.user.email,
						roles: membership.assignments.map((assignment) => assignment.role.key).sort(),
					},
				});
			}
		});
	}
}
