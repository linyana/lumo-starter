import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, AuthAccount } from '../types/index.js';

export const CurrentAccount = createParamDecorator(
	(_data: unknown, context: ExecutionContext): AuthAccount => {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.account) {
			throw new Error('CurrentAccount used on a route without JwtAuthGuard');
		}
		return request.account;
	},
);
