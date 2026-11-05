import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Request/response schemas come from zod via `zodToSchema`, so the document is
 * generated from the same objects that validate traffic.
 */
export const setupSwagger = (app: INestApplication): void => {
	const document = SwaggerModule.createDocument(
		app,
		new DocumentBuilder()
			.setTitle('Lumo API')
			.setDescription('Auth + RBAC reference implementation for the shared contract')
			.setVersion('0.1.0')
			.addBearerAuth()
			.build(),
	);

	SwaggerModule.setup('docs', app, document, {
		jsonDocumentUrl: 'docs/json',
	});
};
