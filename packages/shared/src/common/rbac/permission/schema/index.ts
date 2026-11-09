import { z } from 'zod';
import { PERMISSIONS } from '../constants';

/**
 * Runtime counterpart of the `as const` table. Anything crossing a boundary — a
 * database row, a request body, a JWT claim — goes through it, so a typo becomes
 * a parse error instead of a silent `string`.
 */
export const permissionSchema = z.enum(PERMISSIONS);
