import type { NodeRequest } from '@nestjs/platform-node';
import type { Permission, RoleRef } from '@lumo/shared';

/**
 * Who is acting, and what they may do here. Resolved from the database on every request, so a role
 * change or a revoked membership takes effect on the next call rather than on the next token.
 */
export type AuthActor = {
	id: string;
	email: string;
	username: string;
	createdAt: Date;
	workspaceId: string;
	membershipId: string;
	roles: RoleRef[];
	permissions: Permission[];
};

export type AuthenticatedRequest = NodeRequest & { actor?: AuthActor };
