import type { ERROR_CODES } from './constants';

/** One of the entries in `ERROR_CODES`, by construction. */
export type ErrorCode = (typeof ERROR_CODES)[number];
