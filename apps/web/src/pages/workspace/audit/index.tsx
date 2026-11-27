import { AUDIT_ACTION_META, type AuditAction, type AuditEvent } from '@lumo/shared';
import { useEffect } from 'react';
import { auditApi } from '@/api';
import { Badge, Spinner } from '@/components';
import { useHttp } from '@/hooks';
import type { Color } from '@/lib/control';

const COLOR: Record<AuditAction, Color> = {
	'member.added': 'success',
	'member.roles_changed': 'info',
	'member.removed': 'destructive',
	'role.created': 'success',
	'role.updated': 'info',
	'role.deleted': 'destructive',
};

type Snapshot = { user?: string; roles?: string[]; name?: string; permissions?: string[] };

const snapshotOf = (value: unknown): Snapshot | null =>
	typeof value === 'object' && value !== null ? (value as Snapshot) : null;

const summaryOf = (event: AuditEvent): string => {
	const before = snapshotOf(event.before);
	const after = snapshotOf(event.after);

	if (after?.roles !== undefined || before?.roles !== undefined) {
		const from = before?.roles?.join(', ') ?? '—';
		const to = after?.roles?.join(', ') ?? '—';
		return `${from} → ${to}`;
	}

	if (after?.permissions !== undefined)
		return after.permissions.length === 0 ? 'no permissions' : after.permissions.join(', ');

	if (before?.permissions !== undefined)
		return before.permissions.length === 0 ? 'no permissions' : before.permissions.join(', ');

	return after?.name ?? before?.name ?? '';
};

const subjectOf = (event: AuditEvent): string => {
	const snapshot = snapshotOf(event.after) ?? snapshotOf(event.before);
	return snapshot?.user ?? `${event.targetType} ${event.targetId.slice(0, 8)}`;
};

export const AuditPage = () => {
	const { data, initial, fetchData } = useHttp({ endpoint: () => auditApi.list({ limit: 100 }) });

	useEffect(() => {
		void fetchData();
	}, [fetchData]);

	const events = data ?? [];

	return (
		<div className="space-y-3">
			<div>
				<h1 className="text-xl font-semibold">Audit log</h1>
				<p className="text-sm text-muted-foreground">
					Every privilege change in this workspace. Rows are appended and never edited.
				</p>
			</div>

			{initial ? (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Spinner size={1} label="Loading the audit log" />
					Loading…
				</div>
			) : (
				<div className="divide-y rounded-lg border">
					{events.map((event) => (
						<div
							key={event.id}
							className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm"
						>
							<Badge variant="soft" color={COLOR[event.action]}>
								{AUDIT_ACTION_META[event.action]}
							</Badge>
							<span className="font-medium">{event.actorEmail ?? 'system'}</span>
							<span className="text-muted-foreground">{subjectOf(event)}</span>
							<span className="font-mono text-xs">{summaryOf(event)}</span>
							<span className="ms-auto font-mono text-xs text-muted-foreground">
								{new Date(event.createdAt).toLocaleString()}
							</span>
						</div>
					))}

					{events.length === 0 && (
						<p className="px-4 py-6 text-center text-sm text-muted-foreground">
							Nothing has changed yet.
						</p>
					)}
				</div>
			)}
		</div>
	);
};
