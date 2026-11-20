import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { DB_POOL, DB_TRANSACTION } from '../config/runtime/index.js';
import { PrismaClient } from '../../generated/prisma/client.js';

/**
 * Prisma 7 has no bundled query engine: the client talks to Postgres through a
 * driver adapter, created here from the same DATABASE_URL the CLI migrates with.
 *
 * The pool is built here rather than by the adapter, because the pool is what an
 * interactive transaction waits on: its size and its timeout decide whether a
 * request queues or fails, and neither is visible when the adapter is handed a
 * bare connection string. `disposeExternalPool` keeps `$disconnect` meaning what
 * it says — the pool closes with the process.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(PrismaService.name);

	constructor(config: ConfigService) {
		const pool = new pg.Pool({
			connectionString: config.getOrThrow<string>('DATABASE_URL'),
			...DB_POOL,
		});

		super({
			adapter: new PrismaPg(pool, { disposeExternalPool: true }),
			transactionOptions: DB_TRANSACTION,
		});
	}

	async onModuleInit(): Promise<void> {
		await this.$connect();
		this.logger.log('Connected to PostgreSQL');
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
	}
}
