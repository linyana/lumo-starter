import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
	HealthCheck,
	HealthCheckService,
	HealthIndicatorService,
	type HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../../common/db/prisma.service.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { SkipEnvelope } from '../../common/decorators/skip-envelope.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly indicator: HealthIndicatorService,
		private readonly prisma: PrismaService,
	) {}

	@Public()
	@SkipEnvelope()
	@Get()
	@HealthCheck()
	check() {
		return this.health.check([() => this.checkDatabase()]);
	}

	private async checkDatabase(): Promise<HealthIndicatorResult> {
		const indicator = this.indicator.check('database');
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return indicator.up();
		} catch (error) {
			return indicator.down({
				message: error instanceof Error ? error.message : 'database unreachable',
			});
		}
	}
}
