import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, AuthUser } from '../types/index.js';

export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthUser => {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.user) {
			throw new Error('CurrentUser used on a route without JwtAuthGuard');
		}
		return request.user;
	},
);
