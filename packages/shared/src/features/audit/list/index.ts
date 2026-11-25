import { z } from 'zod';
import { AUDIT_ACTIONS } from '../constants';

export const listAuditQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(200).optional(),
	action: z.enum(AUDIT_ACTIONS).optional(),
	targetId: z.uuid({ error: 'Not a valid target id' }).optional(),
});
