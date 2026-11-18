import { z } from 'zod';
import { ROLES } from '../constants';

/** Runtime counterpart of `ROLES`, for a row or a body that arrives as `string`. */
export const roleSchema = z.enum(ROLES);

export const roleListSchema = z
	.array(roleSchema)
	.min(1, { error: 'At least one role is required' });
