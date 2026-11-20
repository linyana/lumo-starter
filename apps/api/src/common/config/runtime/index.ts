/**
 * Values that are decisions, not deployment secrets.
 *
 * `.env` keeps only what changes between machines: the connection string and
 * the signing secret. Everything here is deliberately the same everywhere — a
 * knob nobody turns costs attention every time someone reads the config. Move a
 * value back into `env/index.ts` the day a second environment needs it
 * different.
 */

/**
 * `NODE_ENV` is read straight from the process instead of going through
 * `envSchema`: whoever starts the process (a shell, Docker, CI) decides it, and
 * its absence means development. Keeping it out of the schema also keeps it out
 * of `.env.example` — the one thing you must not get wrong by copying a file.
 */
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

export const PORT = 3000;
export const LOG_LEVEL = 'info';

/** `jsonwebtoken` duration string for the access token. */
export const ACCESS_TOKEN_TTL = '15m' as const;
/** Refresh tokens are opaque, so this is a day count rather than a duration. */
export const REFRESH_TOKEN_TTL_DAYS = 30;

/** One bucket per IP, every route. `ttl` is milliseconds. */
export const THROTTLE = { ttl: 60_000, limit: 120 } as const;

/**
 * The connections one API process opens. `max` is also how many interactive transactions can run
 * at once, since each one holds a connection for its whole duration; the driver's own default for
 * `connectionTimeoutMillis` is no timeout at all, which turns a full pool into a request that
 * never answers instead of one that fails.
 */
export const DB_POOL = {
	max: 10,
	connectionTimeoutMillis: 5_000,
	idleTimeoutMillis: 30_000,
} as const;

/**
 * How long an interactive transaction may wait for a connection, and then how long it may run.
 * Prisma's defaults (2s / 5s) are sized for a warm server; a machine that is recompiling, or a
 * database that has just been started, spends that budget before the first statement is sent.
 */
export const DB_TRANSACTION = { maxWait: 5_000, timeout: 10_000 } as const;
