import type { Permission } from '@lumo/shared';
import type { ComponentType } from 'react';

/**
 * The shape of the route table. Types only — `src/routes.tsx` holds the table
 * itself, `providers/routes/index.tsx` turns it into route objects.
 */

/** Who may see a bare page. `anonymous` is the inverse guard (signed-in goes home). */
export type RouteAccess = 'public' | 'authenticated' | 'anonymous';

export type NavEntry = {
	/** Nav rows sharing a group sit under one heading, in table order. */
	group: string;
	label: string;
	icon?: ComponentType;
};

/**
 * Where a page sits, and who may enter it. Only a `bare` page names its access: a `shell` page sits
 * inside the frame that asked for the session, so restating it on every row would be the same
 * answer twice.
 */
type Layout =
	/** Inside the rail, whose frame requires a signed-in session. */
	| { layout: 'shell' }
	/** Owns the whole page, so it is the one that says who may see it. */
	| { layout: 'bare'; access: RouteAccess };

export type AppRoute = Layout & {
	/** Path below the shell's root. Omitted means the index route. */
	path?: string;
	page: ComponentType;
	/** Hides the page when the role lacks it; the API enforces the same permission. */
	permission?: Permission;
	/** Present means the shell draws a row for this page; absent means no row. */
	nav?: NavEntry;
};
