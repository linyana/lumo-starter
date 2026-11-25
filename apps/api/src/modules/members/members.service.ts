import { Injectable } from '@nestjs/common';
import {
	BASE_ROLE_KEY,
	SYSTEM_ROLE_META,
	type CreateMemberInput,
	type ListMembersQuery,
	type Member as WireMember,
	type Paginated,
	type RoleRef,
	type UpdateMemberInput,
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
import { memberWireSelect, toWireMember } from './mapper/index.js';

const membershipSelect = {
	id: true,
	user: { select: memberWireSelect },
	assignments: { select: { role: { select: roleRefSelect } } },
} as const satisfies Prisma.MembershipSelect;

type MembershipWireRow = Prisma.MembershipGetPayload<{ select: typeof membershipSelect }>;

const toWireMemberRow = (row: MembershipWireRow): WireMember =>
	toWireMember({
		row: row.user,
		roles: row.assignments.map((assignment) => toRoleRef(assignment.role)),
	});

@Injectable()
export class MembersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly audit: AuditService,
		private readonly guard: AssignmentGuard,
	) {}

	async list({
		query,
		workspaceId,
	}: {
		query: ListMembersQuery;
		workspaceId: string;
	}): Promise<Paginated<WireMember>> {
		const where: Prisma.MembershipWhereInput = {
			workspaceId,
			user: {
				email: query.email ? { contains: query.email, mode: 'insensitive' } : undefined,
				OR: query.search
					? [
							{ email: { contains: query.search, mode: 'insensitive' } },
							{ username: { contains: query.search, mode: 'insensitive' } },
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

		return { ...page, items: page.items.map(toWireMemberRow) };
	}

	async getById({ id, workspaceId }: { id: string; workspaceId: string }): Promise<WireMember> {
		const membership = await this.prisma.membership.findUnique({
			where: { userId_workspaceId: { userId: id, workspaceId } },
			select: membershipSelect,
		});
		if (!membership) throw new AppException('NOT_FOUND');
		return toWireMemberRow(membership);
	}

	async assignableRoles({ actor }: { actor: AuthActor }): Promise<RoleRef[]> {
		const rows = await this.prisma.role.findMany({
			where: { OR: [{ system: true }, { workspaceId: actor.workspaceId }] },
			orderBy: [{ system: 'desc' }, { key: 'asc' }],
			select: { key: true, name: true, permissions: { select: { permissionKey: true } } },
		});

		const canRead = canReadRoles(actor);

		return rows
			.filter((role) => canRead || role.key === BASE_ROLE_KEY)
			.filter((role) =>
				this.guard.covers({
					actor,
					permissions: decodePermissions(role.permissions.map((row) => row.permissionKey)),
				}),
			)
			.map(toRoleRef);
	}

	async create({
		actor,
		input,
	}: {
		actor: AuthActor;
		input: CreateMemberInput;
	}): Promise<WireMember> {
		await assertUserFieldFree({ prisma: this.prisma, field: 'email', value: input.email });
		await assertUserFieldFree({ prisma: this.prisma, field: 'username', value: input.username });

		const roles = await rolesByKey({
			client: this.prisma,
			workspaceId: actor.workspaceId,
			keys: this.assignableKeys({ actor, roles: input.roles }),
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

		return toWireMemberRow(membership);
	}

	async update({
		actor,
		id,
		input,
	}: {
		actor: AuthActor;
		id: string;
		input: UpdateMemberInput;
	}): Promise<WireMember> {
		const membership = await this.prisma.membership.findUnique({
			where: { userId_workspaceId: { userId: id, workspaceId: actor.workspaceId } },
			select: membershipSelect,
		});
		if (!membership) throw new AppException('NOT_FOUND');

		const current = toWireMemberRow(membership);

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
			const held = toWireMemberRow(fresh).roles;

			const next =
				input.roles === undefined
					? null
					: await rolesByKey({
							client: tx,
							workspaceId: actor.workspaceId,
							keys: this.assignableKeys({ actor, roles: input.roles }),
						});

			if (next !== null) {
				await this.guard.assertCanAssign({
					actor,
					membership: {
						id: membership.id,
						roles: held,
						permissions: await this.guard.permissionsOf({
							client: tx,
							membershipId: membership.id,
						}),
					},
					next,
					client: tx,
				});
			}

			await tx.user.update({
				where: { id },
				data: { email: input.email, username: input.username },
			});

			if (next === null) {
				return tx.membership.findUniqueOrThrow({
					where: { id: membership.id },
					select: membershipSelect,
				});
			}

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

		return toWireMemberRow(updated);
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
					assignments: {
						select: {
							role: {
								select: { key: true, permissions: { select: { permissionKey: true } } },
							},
						},
					},
				},
			});

			if (memberships.length !== userIds.length) throw new AppException('NOT_FOUND');

			for (const membership of memberships) {
				this.guard.assertCanManage({
					actor,
					permissions: decodePermissions(
						membership.assignments.flatMap((assignment) =>
							assignment.role.permissions.map((row) => row.permissionKey),
						),
					),
					target: 'those members',
				});
			}

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

	private assignableKeys({
		actor,
		roles,
	}: {
		actor: AuthActor;
		roles?: readonly string[];
	}): string[] {
		const keys = roles === undefined || roles.length === 0 ? [BASE_ROLE_KEY] : [...roles];

		if (canReadRoles(actor)) return keys;

		const beyond = keys.filter((key) => key !== BASE_ROLE_KEY);
		if (beyond.length === 0) return keys;

		throw new AppException({
			code: 'FORBIDDEN',
			message: `You cannot assign ${beyond.join(', ')}: you cannot read the role list, so only ${SYSTEM_ROLE_META[BASE_ROLE_KEY]} can be handed out`,
		});
	}
}

const canReadRoles = (actor: AuthActor): boolean => actor.permissions.includes('role:read');
