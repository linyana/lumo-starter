import { Injectable } from '@nestjs/common';
import type { AuditAction, AuditEvent, ListAuditQuery } from '@lumo/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../common/db/prisma.service.js';
import type { AuthActor } from '../../common/types/index.js';
import { auditWireSelect, toWireAuditEvent } from './mapper/index.js';

type AuditWriter = Pick<Prisma.TransactionClient, 'auditEvent'>;

const DEFAULT_LIMIT = 50;

@Injectable()
export class AuditService {
	constructor(private readonly prisma: PrismaService) {}

	async record({
		actor,
		action,
		targetType,
		targetId,
		before,
		after,
		client,
	}: {
		actor: AuthActor;
		action: AuditAction;
		targetType: string;
		targetId: string;
		before?: unknown;
		after?: unknown;
		client?: AuditWriter;
	}): Promise<void> {
		const writer: AuditWriter = client ?? this.prisma;

		await writer.auditEvent.create({
			data: {
				workspaceId: actor.workspaceId,
				actorUserId: actor.id,
				actorEmail: actor.email,
				action,
				targetType,
				targetId,
				before: before === undefined ? undefined : (before as Prisma.InputJsonValue),
				after: after === undefined ? undefined : (after as Prisma.InputJsonValue),
			},
		});
	}

	async list({
		workspaceId,
		query,
	}: {
		workspaceId: string;
		query: ListAuditQuery;
	}): Promise<AuditEvent[]> {
		const rows = await this.prisma.auditEvent.findMany({
			where: { workspaceId, action: query.action, targetId: query.targetId },
			orderBy: { createdAt: 'desc' },
			take: query.limit ?? DEFAULT_LIMIT,
			select: auditWireSelect,
		});

		return rows.map(toWireAuditEvent);
	}
}
