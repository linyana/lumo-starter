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
import { AuditModule } from './modules/audit/audit.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthorizationModule } from './modules/authorization/authorization.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { MembersModule } from './modules/members/members.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
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
		AuthorizationModule,
		AuditModule,
		AuthModule,
		MembersModule,
		RolesModule,
		SettingsModule,
		HealthModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: PermissionsGuard },
		{ provide: APP_FILTER, useClass: AllExceptionsFilter },
		{ provide: APP_INTERCEPTOR, useClass: DelayInterceptor },
		{ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
	],
})
export class AppModule {}
