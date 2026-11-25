import type { NodeRequest } from '@nestjs/platform-node';
import type { Role } from '@lumo/shared';

export type AuthAccount = {
	id: string;
	email: string;
	roles: Role[];
};

export type AuthenticatedRequest = NodeRequest & { account?: AuthAccount };
