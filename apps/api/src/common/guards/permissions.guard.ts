import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, type Permission } from '@lumo/shared';
import { AUTHENTICATED_ONLY_KEY } from '../decorators/authenticated-only.decorator.js';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { AppException } from '../errors/app.exception.js';
import type { AuthenticatedRequest } from '../types/index.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const targets = [context.getHandler(), context.getClass()];

		if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) return true;

		const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, targets);

		if (!required || required.length === 0) {
			if (this.reflector.getAllAndOverride<boolean>(AUTHENTICATED_ONLY_KEY, targets)) return true;

			throw new AppException({
				code: 'INTERNAL',
				message:
					'This route declares no access rule. Mark it @Public, @AuthenticatedOnly or @RequirePermissions.',
			});
		}

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.actor) throw new AppException('UNAUTHORIZED');
		if (!hasPermission({ permissions: request.actor.permissions, required })) {
			throw new AppException('FORBIDDEN');
		}

		return true;
	}
}
