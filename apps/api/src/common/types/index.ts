import type { NodeRequest } from '@nestjs/platform-node';
import type { Role } from '@lumo/shared';

export type AuthUser = {
	id: string;
	email: string;
	roles: Role[];
};

export type AuthenticatedRequest = NodeRequest & { user?: AuthUser };
