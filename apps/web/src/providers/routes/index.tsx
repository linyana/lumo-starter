import { useMemo } from 'react';
import { createBrowserRouter, Link, NavLink, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RedirectIfAuthenticated, RequireAccess, RequireAuth, useAuth } from '@/providers/auth';
import { AppShell, type LayoutNavEntry, type LayoutNavItem } from '@/providers/layout';
import { routes } from '@/routes';
import type { AppRoute, NavEntry } from './types';

export type { AppRoute, NavEntry, RouteAudience } from './types';

type ShellRoute = Extract<AppRoute, { layout: 'shell' }>;

type NavRoute = ShellRoute & { nav: NavEntry };

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
		render: <NavLink to={href} />,
	};
};

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

const AuthorizedShell = () => {
	const { filter } = useAuth();
	const nav = useMemo(() => navFor(filter(navRoutes)), [filter]);

	return <AppShell nav={nav} />;
};

const shell = (
	<RequireAuth>
		<AuthorizedShell />
	</RequireAuth>
);

const router = createBrowserRouter([
	{ element: shell, children: shellRoutes.map(routeObjectFor) },
	...bareRoutes.map(routeObjectFor),
	{ path: '*', element: <NotFoundPage /> },
]);

export const Routes = () => <RouterProvider router={router} />;
