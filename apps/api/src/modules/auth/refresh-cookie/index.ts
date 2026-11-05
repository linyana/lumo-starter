import type { NodeCookieOptions, NodeResponse } from '@nestjs/platform-node';
import { isProduction } from '../../../common/config/runtime/index.js';

export const REFRESH_COOKIE = 'lumo_refresh';
/** Only /api/auth receives the cookie, so other routes cannot leak it. */
export const REFRESH_COOKIE_PATH = '/api/auth';

/**
 * Host-only and `Secure` outside development. A cross-site or subdomain
 * deployment would have to add `domain` and `sameSite: 'none'` here — which
 * also means it needs a CSRF token, the reason this starter stays same-origin.
 */
const baseOptions = (): NodeCookieOptions => ({
	httpOnly: true,
	secure: isProduction(),
	// Lax + same-origin deployment keeps CSRF off the table without a token
	// dance; `None` would be needed only for a cross-site frontend.
	sameSite: 'lax',
	path: REFRESH_COOKIE_PATH,
});

/** `maxAge` is in milliseconds, the way the adapter's `res.cookie` reads it. */
export const setRefreshCookie = (res: NodeResponse, token: string, expiresAt: Date): void => {
	res.cookie(REFRESH_COOKIE, token, {
		...baseOptions(),
		maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
	});
};

export const clearRefreshCookie = (res: NodeResponse): void => {
	res.clearCookie(REFRESH_COOKIE, baseOptions());
};
