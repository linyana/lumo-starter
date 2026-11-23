import { useMemo } from 'react';
import { createBrowserRouter, Link, NavLink, useLocation, type RouteObject } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RedirectIfAuthenticated, RequireAccess, RequireAuth, useAuth } from '@/providers/auth';
import { AppShell, type LayoutNavEntry, type LayoutNavItem } from '@/providers/layout';
import { routes } from '@/routes';
import type { AppRoute, NavChild, NavEntry } from './types';

export type { AppRoute, NavChild, NavEntry, RouteAudience } from './types';

type ShellRoute = Extract<AppRoute, { layout: 'shell' }>;

type NavRoute = ShellRoute & { nav: NavEntry };

type AccessFilter = <T extends { access?: NavChild['access'] }>(items: readonly T[]) => T[];

const keyFor = (route: AppRoute): string => route.path ?? 'index';
const hrefFor = (path?: string): string => (path ? `/${path}` : '/');

const linkFor = ({
	key,
	label,
	icon: Icon,
	href,
}: {
	key: string;
	label: string;
	icon?: NavEntry['icon'];
	href: string;
}): LayoutNavItem => ({
	type: 'item',
	key,
	label,
	icon: Icon ? <Icon /> : undefined,
	href,
	render: <NavLink to={href} />,
});

const childFor = (child: NavChild): LayoutNavItem =>
	linkFor({ key: child.path, label: child.label, icon: child.icon, href: hrefFor(child.path) });

const itemFor = ({
	route,
	children,
	pathname,
}: {
	route: NavRoute;
	children: LayoutNavItem[];
	pathname: string;
}): LayoutNavItem => {
	const href = hrefFor(route.path);
	return {
		...linkFor({ key: keyFor(route), label: route.nav.label, icon: route.nav.icon, href }),
		children: children.length === 0 ? undefined : children,
		defaultOpen: children.some((child) => child.href === pathname) || undefined,
	};
};

const navFor = ({
	navRoutes,
	pathname,
	filter,
}: {
	navRoutes: NavRoute[];
	pathname: string;
	filter: AccessFilter;
}): LayoutNavEntry[] => {
	const childrenOf = (route: NavRoute): LayoutNavItem[] =>
		filter(route.nav.children ?? []).map(childFor);

	const visible = navRoutes.filter(
		(route) => route.nav.children === undefined || childrenOf(route).length > 0,
	);
	const groups = [...new Set(visible.map((route) => route.nav.group))];

	return groups.map((group) => ({
		type: 'group',
		label: group,
		children: visible
			.filter((route) => route.nav.group === group)
			.map((route) => itemFor({ route, pathname, children: childrenOf(route) })),
	}));
};

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
	const { pathname } = useLocation();
	const nav = useMemo(
		() => navFor({ navRoutes: filter(navRoutes), pathname, filter }),
		[filter, pathname],
	);

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
