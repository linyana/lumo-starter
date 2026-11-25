import { z } from 'zod';
import { AUDIT_ACTIONS } from '../constants';

export const auditActionSchema = z.enum(AUDIT_ACTIONS);

export const auditEventSchema = z.object({
	id: z.string(),
	action: auditActionSchema,
	targetType: z.string(),
	targetId: z.string(),
	actorUserId: z.string().nullable(),
	actorEmail: z.string().nullable(),
	before: z.unknown(),
	after: z.unknown(),
	createdAt: z.iso.datetime(),
});
