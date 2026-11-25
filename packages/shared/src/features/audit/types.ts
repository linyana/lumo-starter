import type { z } from 'zod';
import type { AUDIT_ACTIONS } from './constants';
import type { auditEventSchema } from './row';
import type { listAuditQuerySchema } from './list';

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditEvent = z.infer<typeof auditEventSchema>;

export type ListAuditQuery = z.infer<typeof listAuditQuerySchema>;
