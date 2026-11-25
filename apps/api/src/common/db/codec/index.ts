import { permissionSchema, type Permission } from '@lumo/shared';

/** Keeps a permission key that no longer exists in the code catalog from flowing out as a `string`. */
export const decodePermissions = (keys: readonly string[]): Permission[] =>
	[...new Set(keys)].map((key) => permissionSchema.parse(key));
