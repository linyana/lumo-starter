import type { PERMISSIONS } from './constants';

export type Permission = (typeof PERMISSIONS)[number];

export type PermissionResource = Permission extends `${infer Resource}:${string}`
	? Resource
	: never;
