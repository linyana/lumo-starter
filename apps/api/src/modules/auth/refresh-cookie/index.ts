import type { NodeCookieOptions, NodeResponse } from '@nestjs/platform-node';
import { isProduction } from '../../../common/config/runtime/index.js';

export const REFRESH_COOKIE = 'lumo_refresh';
export const REFRESH_COOKIE_PATH = '/api/auth';

const baseOptions = (): NodeCookieOptions => ({
	httpOnly: true,
	secure: isProduction(),
	sameSite: 'lax',
	path: REFRESH_COOKIE_PATH,
});

export const setRefreshCookie = ({
	res,
	token,
	expiresAt,
}: {
	res: NodeResponse;
	token: string;
	expiresAt: Date;
}): void => {
	res.cookie(REFRESH_COOKIE, token, {
		...baseOptions(),
		maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
	});
};

export const clearRefreshCookie = (res: NodeResponse): void => {
	res.clearCookie(REFRESH_COOKIE, baseOptions());
};
