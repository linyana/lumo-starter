import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, type Permission } from '@lumo/shared';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { AppException } from '../errors/app.exception.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Runs after `JwtAuthGuard`. Role → permission expansion happens in the shared
 * package, so the button the frontend hides is hidden by the same expression
 * the backend evaluates.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!required || required.length === 0) return true;

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		if (!request.user) throw new AppException('UNAUTHORIZED');
		if (!hasPermission(request.user.roles, required)) throw new AppException('FORBIDDEN');

		return true;
	}
}
