import type { PERMISSIONS } from './constants';

/** One of the entries in `PERMISSIONS`, by construction. */
export type Permission = (typeof PERMISSIONS)[number];
