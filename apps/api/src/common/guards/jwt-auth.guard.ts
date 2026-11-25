import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { NodeRequest } from '@nestjs/platform-node';
import { AuthorizationService } from '../../modules/authorization/authorization.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AppException } from '../errors/app.exception.js';
import type { AuthenticatedRequest } from '../types/index.js';

export type AccessTokenPayload = {
	sub: string;
	wid: string;
};

const bearerToken = (request: NodeRequest): string | undefined => {
	const header = request.headers.authorization;
	if (!header) return undefined;
	const [scheme, token] = header.split(' ');
	return scheme?.toLowerCase() === 'bearer' ? token : undefined;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
		private readonly authorization: AuthorizationService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const token = bearerToken(request);
		if (!token) throw new AppException('UNAUTHORIZED');

		let payload: AccessTokenPayload;
		try {
			payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
				secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
			});
		} catch (error) {
			const expired = error instanceof Error && error.name === 'TokenExpiredError';
			throw new AppException({
				code: 'UNAUTHORIZED',
				message: expired
					? 'Your session expired, please sign in again'
					: 'Invalid token, please sign in again',
			});
		}

		const actor = await this.authorization.resolveActor({
			userId: payload.sub,
			workspaceId: payload.wid,
		});

		if (!actor)
			throw new AppException({
				code: 'UNAUTHORIZED',
				message: 'You no longer have access to that workspace',
			});

		request.actor = actor;
		return true;
	}
}
