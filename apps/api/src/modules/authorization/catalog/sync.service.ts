import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/db/prisma.service.js';
import { syncAuthorizationCatalog } from './index.js';

@Injectable()
export class CatalogSyncService implements OnApplicationBootstrap {
	private readonly logger = new Logger(CatalogSyncService.name);

	constructor(
		private readonly config: ConfigService,
		private readonly prisma: PrismaService,
	) {}

	async onApplicationBootstrap(): Promise<void> {
		if (this.config.get<string>('SYNC_PERMISSION_CATALOG') !== 'on') {
			this.logger.log('Permission catalog sync is off — run pnpm db:catalog after changing it');
			return;
		}

		await syncAuthorizationCatalog({ db: this.prisma });
		this.logger.log('Permission catalog and system roles are in step with the code');
	}
}
