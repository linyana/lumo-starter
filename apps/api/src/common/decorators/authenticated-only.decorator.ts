import { SetMetadata } from '@nestjs/common';

export const AUTHENTICATED_ONLY_KEY = 'authenticatedOnly';

export const AuthenticatedOnly = (): MethodDecorator & ClassDecorator =>
	SetMetadata(AUTHENTICATED_ONLY_KEY, true);
