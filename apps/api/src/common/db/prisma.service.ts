import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { DB_POOL, DB_TRANSACTION } from '../config/runtime/index.js';
import { PrismaClient } from '../../generated/prisma/client.js';

const logger = new Logger('PrismaService');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor(config: ConfigService) {
		const pool = new pg.Pool({
			connectionString: config.getOrThrow<string>('DATABASE_URL'),
			...DB_POOL,
		});

		// An idle client dying (database restart, network blip) is otherwise silent.
		pool.on('error', (err: Error) => {
			logger.warn(`Database client error: ${err.message}`);
		});

		super({
			adapter: new PrismaPg(pool, { disposeExternalPool: true }),
			transactionOptions: DB_TRANSACTION,
		});
	}

	async onModuleInit(): Promise<void> {
		await this.$connect();
		await this.$queryRaw`SELECT 1`;
		logger.log('Connected to PostgreSQL');
	}

	async onModuleDestroy(): Promise<void> {
		await this.$disconnect();
	}
}
