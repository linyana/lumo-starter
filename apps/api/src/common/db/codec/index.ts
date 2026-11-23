import { roleSchema, type Role } from '@lumo/shared';

export const decodeRoles = (roles: readonly string[]): Role[] =>
	roles.map((role) => roleSchema.parse(role));
