import { Injectable } from '@nestjs/common';
import type { CreateRoleInput, Role as WireRole, UpdateRoleInput } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { decodePermissions } from '../../common/db/codec/index.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import { AppException } from '../../common/errors/app.exception.js';
import type { AuthActor } from '../../common/types/index.js';
import { AuditService } from '../audit/audit.service.js';
import { AssignmentGuard } from './assignments/guard.js';
import { roleWireSelect, toWireRole } from './mapper/index.js';

const visibleIn = (workspaceId: string): Prisma.RoleWhereInput => ({
	OR: [{ system: true }, { workspaceId }],
});

const ownedHere = ({
	id,
	workspaceId,
}: {
	id: string;
	workspaceId: string;
}): Prisma.RoleWhereInput => ({
	id,
	OR: [{ system: true }, { workspaceId }],
});

const snapshot = (role: {
	key: string;
	name: string;
	permissions: { permissionKey: string }[];
}): Record<string, unknown> => ({
	key: role.key,
	name: role.name,
	permissions: decodePermissions(role.permissions.map((row) => row.permissionKey)),
});

const slugOf = (name: string): string => {
	const slug = name
		.normalize('NFKD')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 24);

	return slug.length >= 2 ? slug : 'role';
};

@Injectable()
export class RolesService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly audit: AuditService,
		private readonly guard: AssignmentGuard,
	) {}

	async list({ workspaceId }: { workspaceId: string }): Promise<WireRole[]> {
		const rows = await this.prisma.role.findMany({
			where: visibleIn(workspaceId),
			orderBy: [{ system: 'desc' }, { key: 'asc' }],
			select: roleWireSelect,
		});

		return rows.map(toWireRole);
	}

	async create({ actor, input }: { actor: AuthActor; input: CreateRoleInput }): Promise<WireRole> {
		this.guard.assertCanGrantPermissions({ actor, permissions: input.permissions });

		const key = await this.freeKey({ workspaceId: actor.workspaceId, name: input.name });

		const row = await this.prisma.$transaction(async (tx) => {
			const created = await tx.role.create({
				data: {
					key,
					name: input.name,
					system: false,
					workspaceId: actor.workspaceId,
					permissions: {
						createMany: { data: input.permissions.map((permissionKey) => ({ permissionKey })) },
					},
				},
				select: roleWireSelect,
			});

			await this.audit.record({
				client: tx,
				actor,
				action: 'role.created',
				targetType: 'role',
				targetId: created.id,
				after: snapshot(created),
			});

			return created;
		});

		return toWireRole(row);
	}

	async update({
		actor,
		id,
		input,
	}: {
		actor: AuthActor;
		id: string;
		input: UpdateRoleInput;
	}): Promise<WireRole> {
		const existing = await this.editable({ workspaceId: actor.workspaceId, id });
		this.guard.assertCanGrantPermissions({ actor, permissions: input.permissions });

		const row = await this.prisma.$transaction(async (tx) => {
			await tx.rolePermission.deleteMany({ where: { roleId: existing.id } });

			const updated = await tx.role.update({
				where: { id: existing.id },
				data: {
					name: input.name,
					permissions: {
						createMany: { data: input.permissions.map((permissionKey) => ({ permissionKey })) },
					},
				},
				select: roleWireSelect,
			});

			await this.audit.record({
				client: tx,
				actor,
				action: 'role.updated',
				targetType: 'role',
				targetId: updated.id,
				before: snapshot(existing),
				after: snapshot(updated),
			});

			return updated;
		});

		return toWireRole(row);
	}

	async remove({ actor, id }: { actor: AuthActor; id: string }): Promise<void> {
		const existing = await this.editable({ workspaceId: actor.workspaceId, id });

		await this.prisma.$transaction(async (tx) => {
			await tx.role.delete({ where: { id: existing.id } });

			await this.audit.record({
				client: tx,
				actor,
				action: 'role.deleted',
				targetType: 'role',
				targetId: existing.id,
				before: snapshot(existing),
			});
		});
	}

	private async editable({ workspaceId, id }: { workspaceId: string; id: string }) {
		const role = await this.prisma.role.findFirst({
			where: ownedHere({ id, workspaceId }),
			select: {
				id: true,
				key: true,
				name: true,
				system: true,
				permissions: { select: { permissionKey: true } },
			},
		});

		if (!role) throw new AppException('NOT_FOUND');
		if (role.system)
			throw new AppException({
				code: 'FORBIDDEN',
				message: 'That role belongs to the code and cannot be edited',
			});

		return role;
	}

	private async freeKey({
		workspaceId,
		name,
	}: {
		workspaceId: string;
		name: string;
	}): Promise<string> {
		const taken = await this.prisma.role.findMany({
			where: visibleIn(workspaceId),
			select: { key: true },
		});

		const keys = new Set(taken.map((role) => role.key));
		const base = slugOf(name);

		for (let suffix = 1; suffix < 100; suffix += 1) {
			const candidate = suffix === 1 ? base : `${base.slice(0, 28)}-${suffix}`;
			if (!keys.has(candidate)) return candidate;
		}

		throw new AppException({
			code: 'CONFLICT',
			message: 'This workspace has too many roles with that name',
		});
	}
}
