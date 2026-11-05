import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { NodeRequest } from '@nestjs/platform-node';
import { decodeRoles } from '../db/codec/index.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AppException } from '../errors/app.exception.js';
import type { AuthenticatedRequest, AuthUser } from '../types/index.js';

export type AccessTokenPayload = {
	sub: string;
	email: string;
	roles: string[];
};

const bearerToken = (request: NodeRequest): string | undefined => {
	const header = request.headers.authorization;
	if (!header) return undefined;
	const [scheme, token] = header.split(' ');
	return scheme?.toLowerCase() === 'bearer' ? token : undefined;
};

/**
 * Global guard: every route requires a valid access token unless marked
 * `@Public()`. The token is read from the Authorization header only — it is
 * never stored in a cookie, so a CSRF-forged request cannot carry it.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
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

		try {
			const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
				secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
			});

			const user: AuthUser = {
				id: payload.sub,
				email: payload.email,
				roles: decodeRoles(payload.roles),
			};
			request.user = user;
			return true;
		} catch (error) {
			const expired = error instanceof Error && error.name === 'TokenExpiredError';
			throw new AppException({
				code: 'UNAUTHORIZED',
				message: expired
					? 'Your session expired, please sign in again'
					: 'Invalid token, please sign in again',
			});
		}
	}
}
