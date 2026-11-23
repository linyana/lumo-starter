export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const PORT = 3000;
export const LOG_LEVEL = 'info';

export const ACCESS_TOKEN_TTL = '15m' as const;
export const REFRESH_TOKEN_TTL_DAYS = 30;

export const THROTTLE = { ttl: 60_000, limit: 120 } as const;

export const DB_POOL = {
	max: 10,
	connectionTimeoutMillis: 5_000,
	idleTimeoutMillis: 30_000,
} as const;

export const DB_TRANSACTION = { maxWait: 5_000, timeout: 10_000 } as const;
