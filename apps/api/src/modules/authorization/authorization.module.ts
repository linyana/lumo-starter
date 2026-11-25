import { Global, Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service.js';
import { CatalogSyncService } from './catalog/sync.service.js';

@Global()
@Module({
	providers: [AuthorizationService, CatalogSyncService],
	exports: [AuthorizationService],
})
export class AuthorizationModule {}
