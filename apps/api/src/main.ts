import 'reflect-metadata';
import { Logger as NestLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type NestNodeApplication, NodeAdapter } from '@nestjs/platform-node';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { PORT, isProduction } from './common/config/runtime/index.js';
import { setupSwagger } from './common/swagger/setup/index.js';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create<NestNodeApplication>(
		AppModule,
		new NodeAdapter({
			trustProxy: (_address: string, hop: number) => hop === 0,
		}),
		{ bufferLogs: true },
	);
	app.useLogger(app.get(Logger));

	app.setGlobalPrefix('api');

	app.useSecurityHeaders();

	if (!isProduction()) setupSwagger(app);

	app.enableShutdownHooks();

	await app.listen(PORT);

	NestLogger.log(`API ready on http://localhost:${PORT}/api`, 'Bootstrap');
	if (!isProduction()) NestLogger.log(`Swagger on http://localhost:${PORT}/docs`, 'Bootstrap');
}

bootstrap();
