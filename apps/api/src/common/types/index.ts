import type { NodeRequest } from '@nestjs/platform-node';
import type { Role } from '@lumo/shared';

/** What the JWT guard puts on `request.user`. */
export type AuthUser = {
	id: string;
	email: string;
	roles: Role[];
};

/**
 * The request behind `@CurrentUser()`: `NodeRequest`, plus the identity the JWT
 * guard attached. Intersecting here rather than augmenting the adapter's class
 * keeps the extra field visible to whoever asks for it, and nowhere else.
 */
export type AuthenticatedRequest = NodeRequest & { user?: AuthUser };
