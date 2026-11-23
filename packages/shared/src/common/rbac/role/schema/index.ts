import { z } from 'zod';
import { ROLES } from '../constants';

export const roleSchema = z.enum(ROLES);

export const roleListSchema = z
	.array(roleSchema)
	.min(1, { error: 'At least one role is required' });
