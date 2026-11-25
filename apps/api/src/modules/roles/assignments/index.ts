import type { Prisma } from '../../../generated/prisma/client.js';
import { AppException } from '../../../common/errors/app.exception.js';

type AssignmentClient = Pick<Prisma.TransactionClient, 'role' | 'roleAssignment'>;

export type ResolvedRole = {
	id: string;
	key: string;
	name: string;
	permissions: { permissionKey: string }[];
};

export const rolesByKey = async ({
	client,
	workspaceId,
	keys,
}: {
	client: AssignmentClient;
	workspaceId: string;
	keys: readonly string[];
}): Promise<ResolvedRole[]> => {
	const wanted = [...new Set(keys)];

	const rows = await client.role.findMany({
		where: { key: { in: wanted }, OR: [{ system: true }, { workspaceId }] },
		select: { id: true, key: true, name: true, permissions: { select: { permissionKey: true } } },
	});

	if (rows.length !== wanted.length)
		throw new AppException({
			code: 'VALIDATION_FAILED',
			message: 'One of those roles does not exist in this workspace',
		});

	return rows;
};

export const roleByKey = async ({
	client,
	workspaceId,
	key,
}: {
	client: AssignmentClient;
	workspaceId: string;
	key: string;
}): Promise<ResolvedRole> => {
	const [role] = await rolesByKey({ client, workspaceId, keys: [key] });

	if (!role)
		throw new AppException({
			code: 'INTERNAL',
			message: 'The role catalog is missing a system role — run pnpm db:seed',
		});

	return role;
};

export const replaceAssignments = async ({
	client,
	membershipId,
	roleIds,
}: {
	client: AssignmentClient;
	membershipId: string;
	roleIds: readonly string[];
}): Promise<void> => {
	await client.roleAssignment.deleteMany({ where: { membershipId } });

	if (roleIds.length === 0) return;

	await client.roleAssignment.createMany({
		data: roleIds.map((roleId) => ({ membershipId, roleId })),
	});
};

export const lockWorkspace = async ({
	client,
	workspaceId,
}: {
	client: Pick<Prisma.TransactionClient, '$queryRaw'>;
	workspaceId: string;
}): Promise<void> => {
	await client.$queryRaw`SELECT "id" FROM "workspaces" WHERE "id" = ${workspaceId}::uuid FOR UPDATE`;
};

export const ownersLeft = async ({
	client,
	workspaceId,
	excludingMembershipId,
}: {
	client: Pick<Prisma.TransactionClient, 'membership'>;
	workspaceId: string;
	excludingMembershipId?: string;
}): Promise<number> =>
	client.membership.count({
		where: {
			workspaceId,
			id: excludingMembershipId ? { not: excludingMembershipId } : undefined,
			assignments: { some: { role: { key: 'OWNER', system: true } } },
		},
	});
