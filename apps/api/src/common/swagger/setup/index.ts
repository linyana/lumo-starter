import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
