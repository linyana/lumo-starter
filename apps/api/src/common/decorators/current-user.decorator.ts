import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, AuthActor } from '../types/index.js';

export const CurrentActor = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthActor => {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.actor) {
			throw new Error('CurrentActor used on a route without JwtAuthGuard');
		}
		return request.actor;
	},
);
