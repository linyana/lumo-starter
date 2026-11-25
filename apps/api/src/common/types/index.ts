import type { NodeRequest } from '@nestjs/platform-node';
import type { Permission, RoleRef } from '@lumo/shared';

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
