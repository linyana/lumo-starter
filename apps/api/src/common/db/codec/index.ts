import { Logger } from '@nestjs/common';
import { permissionSchema, type Permission } from '@lumo/shared';

const logger = new Logger('PermissionCatalog');

export const decodePermissions = (keys: readonly string[]): Permission[] => {
	const kept = new Set<Permission>();
	const dropped = new Set<string>();

	for (const key of keys) {
		const parsed = permissionSchema.safeParse(key);
		if (parsed.success) kept.add(parsed.data);
		else dropped.add(key);
	}

	if (dropped.size > 0) {
		logger.warn(
			`Ignoring permissions that left the catalog: ${[...dropped].join(', ')} — run pnpm db:catalog`,
		);
	}

	return [...kept];
};
