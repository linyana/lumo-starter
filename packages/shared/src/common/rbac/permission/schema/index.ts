import { z } from 'zod';
import { PERMISSIONS } from '../constants';

export const permissionSchema = z.enum(PERMISSIONS);
