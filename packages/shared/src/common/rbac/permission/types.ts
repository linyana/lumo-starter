import type { PERMISSIONS } from './constants';

export type Permission = (typeof PERMISSIONS)[number];

/** The part before the colon. Adding `order:read` fails compilation until `order` has a label. */
export type PermissionResource = Permission extends `${infer Resource}:${string}`
	? Resource
	: never;
