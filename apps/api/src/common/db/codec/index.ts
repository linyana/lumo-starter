import { roleSchema, type Role } from '@lumo/shared';

/**
 * Narrowing boundary for the "String column + zod validation" decision:
 * a row read from Postgres carries `string[]`, a domain object carries `Role[]`.
 * Decoding here means a bad row explodes at the edge instead of travelling
 * onward as a lie.
 */
export const decodeRoles = (roles: readonly string[]): Role[] =>
	roles.map((role) => roleSchema.parse(role));
