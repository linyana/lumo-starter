import type { AccessCondition } from '@lumo/shared';
import type { ComponentType } from 'react';

/**
 * The shape of the route table. Types only — `src/routes.tsx` holds the table
 * itself, `providers/routes/index.tsx` turns it into route objects.
 */

/**
 * Who a bare page is for — the session question, which is asked before any permission is. The name
 * is not `access`: `access` is the authorization condition every gated thing carries.
 */
export type RouteAudience = 'public' | 'authenticated' | 'anonymous';

export type NavEntry = {
	/** Nav rows sharing a group sit under one heading, in table order. */
	group: string;
	label: string;
	icon?: ComponentType;
};

/**
 * Where a page sits, and who may enter it. Only a `bare` page names its audience: a `shell` page sits
 * inside the frame that asked for the session, so restating it on every row would be the same
 * answer twice.
 */
type Layout =
	/** Inside the rail, whose frame requires a signed-in session. */
	| { layout: 'shell' }
	/** Owns the whole page, so it is the one that says who it is for. */
	| { layout: 'bare'; audience: RouteAudience };

export type AppRoute = Layout & {
	/** Path below the shell's root. Omitted means the index route. */
	path?: string;
	page: ComponentType;
	/**
	 * Who may open the page, and the only gate a row can carry: it hides the rail's row and the page
	 * behind it alike, with the condition every other gated thing states — see `AccessCondition`.
	 */
	access?: AccessCondition;
	/** Present means the shell draws a row for this page; absent means no row. */
	nav?: NavEntry;
};
