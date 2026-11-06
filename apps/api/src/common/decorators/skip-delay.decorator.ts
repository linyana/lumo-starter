import { SetMetadata } from '@nestjs/common';

export const SKIP_DELAY = 'skipDelay';

/**
 * Answer at once instead of after `API_DELAY_MS`. For a route nobody watches:
 * the artificial delay exists to make loading states visible, and a caller that
 * fires it and leaves would only widen the window in which the response — the
 * one carrying a refreshed credential — never lands.
 */
export const SkipDelay = (): MethodDecorator & ClassDecorator => SetMetadata(SKIP_DELAY, true);
