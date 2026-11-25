import type { Prisma } from '../../../generated/prisma/client.js';
import { AppException } from '../../../common/errors/app.exception.js';

type AssignmentClient = Pick<Prisma.TransactionClient, 'role' | 'roleAssignment'>;

export type ResolvedRole = {
	id: string;
	key: string;
	name: string;
	permissions: { permissionKey: string }[];
};

/**
 * Turns wire role keys into this workspace's roles. A key resolves when it is a system role or one of
 * the workspace's own — anything else is a validation failure rather than a silent no-op.
 */
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

/** The role a system feature (registration, the last-owner check) is written against. */
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

/** Assignments are a set, so a member's roles are written by replacing them, never by patching them. */
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

/**
 * Serialises every change that could remove an owner. Counting owners and then writing is a
 * read-then-write: two concurrent demotions each see the other owner and both commit, leaving a
 * workspace nobody can administer. Taking the workspace row first makes the second one wait and then
 * see the truth. Postgres only — the `FOR UPDATE` is why.
 */
export const lockWorkspace = async ({
	client,
	workspaceId,
}: {
	client: Pick<Prisma.TransactionClient, '$queryRaw'>;
	workspaceId: string;
}): Promise<void> => {
	await client.$queryRaw`SELECT "id" FROM "workspaces" WHERE "id" = ${workspaceId}::uuid FOR UPDATE`;
};

/**
 * How many members still hold the system OWNER role in this workspace, optionally ignoring one of
 * them. This is the cardinality constraint that keeps a workspace reachable: at least one owner.
 */
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
