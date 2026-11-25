import { auditActionSchema, type AuditAction, type AuditEvent } from '@lumo/shared';
import type { AuditEvent as AuditRow, Prisma } from '../../../generated/prisma/client.js';

export const auditWireSelect = {
	id: true,
	action: true,
	targetType: true,
	targetId: true,
	actorUserId: true,
	actorEmail: true,
	before: true,
	after: true,
	createdAt: true,
} as const satisfies Prisma.AuditEventSelect;

export type AuditWireRow = Pick<
	AuditRow,
	'id' | 'targetType' | 'targetId' | 'actorUserId' | 'actorEmail' | 'before' | 'after' | 'createdAt'
> & { action: string };

export const toWireAuditEvent = (row: AuditWireRow): AuditEvent => ({
	id: row.id,
	action: auditActionSchema.parse(row.action) as AuditAction,
	targetType: row.targetType,
	targetId: row.targetId,
	actorUserId: row.actorUserId,
	actorEmail: row.actorEmail,
	before: row.before,
	after: row.after,
	createdAt: row.createdAt.toISOString(),
});
