import { SetMetadata } from '@nestjs/common';

export const SKIP_ENVELOPE = 'skipEnvelope';

/** Return the handler's value untouched instead of `{ data: value }`. */
export const SkipEnvelope = (): MethodDecorator & ClassDecorator =>
	SetMetadata(SKIP_ENVELOPE, true);
