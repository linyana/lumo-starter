import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { listAuditQuerySchema, type ListAuditQuery } from '@lumo/shared';
import { CurrentActor } from '../../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../common/decorators/permissions.decorator.js';
import { ZodQuery } from '../../common/pipes/zod-validation.pipe.js';
import type { AuthActor } from '../../common/types/index.js';
import { AuditService } from './audit.service.js';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
	constructor(private readonly audit: AuditService) {}

	@Get()
	@RequirePermissions('audit:read')
	async list(
		@CurrentActor() actor: AuthActor,
		@ZodQuery(listAuditQuerySchema) query: ListAuditQuery,
	) {
		return { events: await this.audit.list({ workspaceId: actor.workspaceId, query }) };
	}
}
