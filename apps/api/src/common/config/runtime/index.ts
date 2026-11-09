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
