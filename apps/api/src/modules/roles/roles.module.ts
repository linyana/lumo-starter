import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { AssignmentGuard } from './assignments/guard.js';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';

@Module({
	imports: [AuditModule],
	controllers: [RolesController],
	providers: [RolesService, AssignmentGuard],
	exports: [AssignmentGuard],
})
export class RolesModule {}
