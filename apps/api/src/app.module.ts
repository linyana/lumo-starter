import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './common/config/env/index.js';
import { LOG_LEVEL, THROTTLE, isProduction } from './common/config/runtime/index.js';
import { PrismaModule } from './common/db/prisma.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { DelayInterceptor } from './common/interceptors/delay.interceptor.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			// One .env at the repo root, shared with docker compose; a local
			// apps/api/.env, if anyone creates one, wins.
			envFilePath: ['../../.env', '.env'],
			validate: validateEnv,
		}),

		LoggerModule.forRoot({
			pinoHttp: {
				level: LOG_LEVEL,
				redact: ['req.headers.authorization', 'req.headers.cookie'],
				autoLogging: false,
				transport: isProduction()
					? undefined
					: {
							target: 'pino-pretty',
							options: { singleLine: true, colorize: true, translateTime: 'HH:MM:ss' },
						},
			},
		}),

		ThrottlerModule.forRoot({ throttlers: [THROTTLE] }),

		JwtModule.register({ global: true }),

		PrismaModule,
		AuthModule,
		UsersModule,
		HealthModule,
	],
	providers: [
		// Order matters: throttle first, then identity, then authorisation.
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: PermissionsGuard },
		{ provide: APP_FILTER, useClass: AllExceptionsFilter },
		// Outermost of the two, so the delay covers whatever the envelope does.
		{ provide: APP_INTERCEPTOR, useClass: DelayInterceptor },
		{ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
	],
})
export class AppModule {}
