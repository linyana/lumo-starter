import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, AuthUser } from '../types/index.js';

/**
 * `@CurrentUser() user: AuthUser` on any route behind the JWT guard. Throws via
 * the guard if the claim is missing, so the non-null assertion is honest.
 */
export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthUser => {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.user) {
			throw new Error('CurrentUser used on a route without JwtAuthGuard');
		}
		return request.user;
	},
);
