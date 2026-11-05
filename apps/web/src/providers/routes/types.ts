import type { Permission } from '@lumo/shared';
import type { ComponentType } from 'react';

/**
 * The shape of the route table. Types only — `src/routes.tsx` holds the table
 * itself, `providers/routes/index.tsx` turns it into route objects.
 */

/** Who may see the page. `anonymous` is the inverse guard (signed-in goes home). */
export type RouteAccess = 'public' | 'authenticated' | 'anonymous';

export type NavEntry = {
	/** Nav rows sharing a group sit under one heading, in table order. */
	group: string;
	label: string;
	icon?: ComponentType;
};

export type AppRoute = {
	/** Path below the shell's root. Omitted means the index route. */
	path?: string;
	/** `shell` renders inside the rail layout; `bare` owns the whole page. */
	layout: 'shell' | 'bare';
	page: ComponentType;
	access: RouteAccess;
	/** Hides the page when the role lacks it; the API enforces the same permission. */
	permission?: Permission;
	/** Present means the shell draws a row for this page; absent means no row. */
	nav?: NavEntry;
};
