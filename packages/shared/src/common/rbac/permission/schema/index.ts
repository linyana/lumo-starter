import { z } from 'zod';
import { PERMISSIONS } from '../constants';

export const permissionSchema = z.enum(PERMISSIONS);

export const permissionListSchema = z
	.array(permissionSchema)
	.min(1, { error: 'Pick at least one permission' });
