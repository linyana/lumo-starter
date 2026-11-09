import type { ROLES } from './constants';

/** One of the entries in `ROLES`, by construction. */
export type Role = (typeof ROLES)[number];
