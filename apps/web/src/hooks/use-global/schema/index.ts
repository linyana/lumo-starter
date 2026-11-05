import { z } from 'zod';
import { THEMES } from '../constants';

/**
 * The runtime counterpart of `GlobalState`, the way `permissionSchema` is the counterpart of
 * `PERMISSIONS`: storage is a boundary, and nothing crosses one without a parse.
 *
 * Each field says here what it does when the stored value is wrong — `catch` answers with the
 * default instead of failing — so a third theme is one entry in `THEMES` and no branch anywhere.
 */
export const themeSchema = z.enum(THEMES);

export const globalSchema = z.object({
	theme: themeSchema.catch('light'),
	collapsed: z.boolean().catch(false),
});

/** What a first visit starts from: the defaults above, read back out of the schema itself. */
export const initial = globalSchema.parse({});

/** A snapshot from storage: what it can supply, or nothing usable. Never a throw. */
export const snapshotSchema = globalSchema.catch(initial);
