import { useMemo } from 'react';
import { NavLink, createBrowserRouter, Link, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { filterAccess } from '@lumo/shared';
import type { LayoutNavEntry, LayoutNavItem } from '@/providers/layout';
import { RedirectIfAuthenticated, RequireAccess, RequireAuth, useAuth } from '@/providers/auth';
import { AppShell } from '@/providers/layout';
import { routes } from '@/routes';
import type { AppRoute, NavEntry } from './types';

export type { AppRoute, NavEntry, RouteAudience } from './types';

/**
 * The one place where route data meets React: guards wrap a page in the order they must run, and
 * the shell is handed the rows that belong inside it. `routes` itself stays a plain table — see
 * `src/routes.tsx`.
 */

/** A row that renders inside the shell — the frame is what requires the session, not the row. */
type ShellRoute = Extract<AppRoute, { layout: 'shell' }>;

/** Only rows the table gave a `nav` block: a screen without one is reachable, just not listed. */
type NavRoute = ShellRoute & { nav: NavEntry };

/**
 * A row's identity and its link target, derived here and nowhere else: the table
 * says `path: 'users'`, the rail says `href: '/users'`, and nobody writes either
 * string twice. The index route is `/`.
 */
const keyFor = (route: AppRoute): string => route.path ?? 'index';
const hrefFor = (route: AppRoute): string => (route.path ? `/${route.path}` : '/');

const itemFor = (route: NavRoute): LayoutNavItem => {
	const { label, icon: Icon } = route.nav;
	const href = hrefFor(route);
	return {
		type: 'item',
		key: keyFor(route),
		label,
		icon: Icon ? <Icon /> : undefined,
		href,
		// The row has to click through the router, not the document: an `href` alone would make
		// the browser fetch the page again. `NavLink` also marks the current row for a screen
		// reader, so the selection the rail draws keeps a name.
		render: <NavLink to={href} />,
	};
};

/** Groups keep the order they first appear in the table; rows keep theirs. */
const navFor = (navRoutes: NavRoute[]): LayoutNavEntry[] =>
	[...new Set(navRoutes.map((route) => route.nav.group))].map((group) => ({
		type: 'group',
		label: group,
		children: navRoutes.filter((route) => route.nav.group === group).map(itemFor),
	}));

const NotFoundPage = () => (
	<div className="grid place-items-center p-12 text-center">
		<div className="space-y-2">
			<h2 className="text-lg font-semibold">Page not found</h2>
			<Link className="text-sm text-primary underline-offset-4 hover:underline" to="/">
				Back to overview
			</Link>
		</div>
	</div>
);

/**
 * Access first, permission second: a visitor who is not signed in is redirected, not told which
 * permission is missing. A shell page needs neither access branch — the frame it renders inside
 * asked the question for the whole rail.
 */
const elementFor = (route: AppRoute) => {
	const Page = route.page;
	const page = route.access ? (
		<RequireAccess access={route.access}>
			<Page />
		</RequireAccess>
	) : (
		<Page />
	);

	if (route.layout === 'shell') return page;
	if (route.audience === 'anonymous')
		return <RedirectIfAuthenticated>{page}</RedirectIfAuthenticated>;
	if (route.audience === 'authenticated') return <RequireAuth>{page}</RequireAuth>;
	return page;
};

const routeObjectFor = (route: AppRoute): RouteObject =>
	route.path === undefined
		? { index: true, element: elementFor(route) }
		: { path: route.path, element: elementFor(route) };

const shellRoutes = routes.filter((route): route is ShellRoute => route.layout === 'shell');
const bareRoutes = routes.filter((route) => route.layout === 'bare');
const navRoutes = shellRoutes.filter((route): route is NavRoute => route.nav !== undefined);

/**
 * The frame that draws the rail, with only the rows this session can open. Which rows exist depends
 * on the role, and the role only exists inside `AuthProvider` — so the filter lives here rather
 * than at module scope, and the shell keeps receiving its rows instead of deriving them.
 *
 * The rows are filtered by the same `access` block a column or a menu row states, so a page, the row
 * that opens it and the actions inside it cannot drift apart. Hiding a row is an affordance, not a
 * boundary: `RequireAccess` still answers for a URL typed by hand, and the API still enforces the
 * same permission.
 */
const AuthorizedShell = () => {
	const { grant } = useAuth();
	// The grant is stable per session, so the rows keep their identity until the roles change.
	const nav = useMemo(() => navFor(filterAccess({ items: navRoutes, grant })), [grant]);

	return <AppShell nav={nav} />;
};

/**
 * The rail is the signed-in app, so its guard wraps the frame rather than each row: a reload shows
 * one full-page loader instead of a rail with a spinner where the page goes, and a session the
 * server cannot confirm takes the whole screen.
 */
const shell = (
	<RequireAuth>
		<AuthorizedShell />
	</RequireAuth>
);

/**
 * Data mode: no server, no file-based routes — just an object the router can
 * reason about. The Vite build emits static files, so this is all the routing
 * the deployment needs.
 */
const router = createBrowserRouter([
	{ element: shell, children: shellRoutes.map(routeObjectFor) },
	...bareRoutes.map(routeObjectFor),
	{ path: '*', element: <NotFoundPage /> },
]);

export const Routes = () => <RouterProvider router={router} />;
