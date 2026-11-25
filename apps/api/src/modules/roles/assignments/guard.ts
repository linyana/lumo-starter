import { Injectable } from '@nestjs/common';
import type { Permission, RoleRef } from '@lumo/shared';
import type { Prisma } from '../../../generated/prisma/client.js';
import { decodePermissions } from '../../../common/db/codec/index.js';
import { AppException } from '../../../common/errors/app.exception.js';
import type { AuthActor } from '../../../common/types/index.js';
import { lockWorkspace, ownersLeft, type ResolvedRole } from './index.js';

const keysOf = (roles: readonly { key: string }[]): string[] =>
	roles.map((role) => role.key).sort();

type GuardClient = Pick<Prisma.TransactionClient, 'membership' | '$queryRaw'>;

@Injectable()
export class AssignmentGuard {
	assertCanGrantPermissions({
		actor,
		permissions,
	}: {
		actor: AuthActor;
		permissions: readonly Permission[];
	}): void {
		const held = new Set(actor.permissions);
		const missing = permissions.filter((permission) => !held.has(permission));

		if (missing.length === 0) return;

		throw new AppException({
			code: 'FORBIDDEN',
			message: `You cannot grant permissions you do not hold: ${missing.join(', ')}`,
		});
	}

	async assertCanAssign({
		actor,
		membership,
		next,
		client,
	}: {
		actor: AuthActor;
		membership: { id: string; roles: readonly RoleRef[] };
		next: readonly ResolvedRole[];
		client: GuardClient;
	}): Promise<void> {
		const losing = keysOf(membership.roles).includes('OWNER') && !keysOf(next).includes('OWNER');

		if (losing) {
			await lockWorkspace({ client, workspaceId: actor.workspaceId });

			const left = await ownersLeft({
				client,
				workspaceId: actor.workspaceId,
				excludingMembershipId: membership.id,
			});

			if (left < 1)
				throw new AppException({
					code: 'FORBIDDEN',
					message:
						membership.id === actor.membershipId
							? 'You are the only owner here, so you cannot drop your own Owner role. Give someone else Owner first, then change yours.'
							: 'That is the only owner here. Give someone else Owner first, then this role can change.',
				});
		}

		this.assertCanGrantPermissions({
			actor,
			permissions: decodePermissions(
				next.flatMap((role) => role.permissions.map((row) => row.permissionKey)),
			),
		});
	}
}
