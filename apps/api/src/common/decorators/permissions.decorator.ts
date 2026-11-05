import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@lumo/shared';

export const PERMISSIONS_KEY = 'permissions';

/**
 * `@RequirePermissions('user:write')` — all listed permissions are required.
 * The check itself lives in `PermissionsGuard` and uses the same
 * `hasPermission()` the frontend calls.
 */
export const RequirePermissions = (
	...permissions: Permission[]
): MethodDecorator & ClassDecorator => SetMetadata(PERMISSIONS_KEY, permissions);
