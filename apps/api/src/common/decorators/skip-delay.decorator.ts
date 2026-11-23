import { SetMetadata } from '@nestjs/common';

export const SKIP_DELAY = 'skipDelay';

export const SkipDelay = (): MethodDecorator & ClassDecorator => SetMetadata(SKIP_DELAY, true);
