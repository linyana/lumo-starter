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
			// Express' `trust proxy: 1`, spelled out: the socket's peer is the one
			// reverse proxy in production, so the client's address is read from
			// X-Forwarded-For there and the throttler buckets per client instead of per
			// proxy. Hop counts have no shorthand (as with Fastify's `trustProxy`).
			trustProxy: (_address: string, hop: number) => hop === 0,
		}),
		{ bufferLogs: true },
	);
	app.useLogger(app.get(Logger));

	app.setGlobalPrefix('api');

	// helmet's job, built into Nest (same headers, same defaults). It registers a
	// request hook on the adapter rather than middleware, so it is set up here.
	app.useSecurityHeaders();

	// Swagger is dev-only: the document lists every route and payload.
	if (!isProduction()) setupSwagger(app);

	app.enableShutdownHooks();

	await app.listen(PORT);

	NestLogger.log(`API ready on http://localhost:${PORT}/api`, 'Bootstrap');
	if (!isProduction()) NestLogger.log(`Swagger on http://localhost:${PORT}/docs`, 'Bootstrap');
}

bootstrap();
