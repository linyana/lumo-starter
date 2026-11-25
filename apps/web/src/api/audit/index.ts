import type { AuditEvent, ListAuditQuery } from '@lumo/shared';
import { api } from '@/lib';

const list = (query: ListAuditQuery = {}): Promise<AuditEvent[]> =>
	api
		.get<{ events: AuditEvent[] }>({ url: '/audit', params: { ...query } })
		.then((payload) => payload.events);

export const auditApi = { list };
