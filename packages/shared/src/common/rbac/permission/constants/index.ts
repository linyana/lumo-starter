import type { Permission } from '../types';

/**
 * Every permission the app knows about. This array is the single source of
 * truth: the union type, the runtime zod enum, the permission guard, the
 * frontend navigation and the label map are all derived from it.
 *
 * Adding a permission here is the only edit required — `PERMISSION_META`
 * fails to compile until the new entry gets a label.
 */
export const PERMISSIONS = ['user:read', 'user:write', 'user:delete'] as const;

/** Human label per permission, for the UI. The guard never reads it. */
export const PERMISSION_META = {
	'user:read': 'View users',
	'user:write': 'Edit users',
	'user:delete': 'Delete users',
} satisfies Record<Permission, string>;
