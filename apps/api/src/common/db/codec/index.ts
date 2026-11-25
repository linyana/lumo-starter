import { permissionSchema, type Permission } from '@lumo/shared';

export const decodePermissions = (keys: readonly string[]): Permission[] =>
	[...new Set(keys)].map((key) => permissionSchema.parse(key));
