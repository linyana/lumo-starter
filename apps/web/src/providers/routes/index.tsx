import { useMemo } from 'react';
import {
	createBrowserRouter,
	Link,
	Navigate,
	NavLink,
	useLocation,
	type RouteObject,
} from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { RedirectIfAuthenticated, RequireAccess, RequireAuth, useAuth } from '@/providers/auth';
import {
	AppShell,
	type LayoutNavEntry,
	type LayoutNavItem,
	type LayoutNavSeparator,
	type LayoutNavSubEntry,
	type LayoutNavSubGroup,
} from '@/providers/layout';
import { routes } from '@/routes';
import { workspaceHref } from '@/lib';
import type { AppRoute, NavChild, NavEntry } from './types';
import { WorkspaceScope } from './workspace-guard';

export type { AppRoute, NavChild, NavEntry, RouteAudience } from './types';

type ShellRoute = Extract<AppRoute, { layout: 'shell' }>;

type NavRoute = ShellRoute & { nav: NavEntry };

type AccessFilter = <T extends { access?: NavChild['access'] }>(items: readonly T[]) => T[];

type Href = (path?: string) => string;

const keyFor = (route: AppRoute): string => route.path ?? 'index';

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

const grouped = <T,>({
	items,
	groupOf,
	toItem,
}: {
	items: readonly T[];
	groupOf: (item: T) => string | undefined;
	toItem: (item: T) => LayoutNavItem;
}): LayoutNavSubEntry[] => {
	const blocks: LayoutNavSubEntry[] = [];
	const groups = new Map<string, LayoutNavSubGroup>();

	for (const item of items) {
		const label = groupOf(item);
		if (label === undefined) {
			blocks.push(toItem(item));
			continue;
		}

		let group = groups.get(label);
		if (group === undefined) {
			group = { type: 'group', label, children: [] };
			groups.set(label, group);
			blocks.push(group);
		}
		group.children.push(toItem(item));
	}

	return blocks;
};

const hasHref = ({ entries, href }: { entries: LayoutNavSubEntry[]; href: string }): boolean =>
	entries.some((entry) =>
		entry.type === 'group'
			? hasHref({ entries: entry.children, href })
			: entry.href === href || hasHref({ entries: entry.children ?? [], href }),
	);

const childFor = ({ child, href }: { child: NavChild; href: Href }): LayoutNavItem =>
	linkFor({ key: child.path, label: child.label, icon: child.icon, href: href(child.path) });

const childrenFor = ({
	children,
	href,
}: {
	children: readonly NavChild[];
	href: Href;
}): LayoutNavSubEntry[] =>
	grouped({
		items: children,
		groupOf: (child) => child.group,
		toItem: (child) => childFor({ child, href }),
	});

const itemFor = ({
	route,
	children,
	href,
	pathname,
}: {
	route: NavRoute;
	children: LayoutNavSubEntry[];
	href: Href;
	pathname: string;
}): LayoutNavItem => {
	const own = href(route.path);
	return {
		...linkFor({ key: keyFor(route), label: route.nav.label, icon: route.nav.icon, href: own }),
		children: children.length === 0 ? undefined : children,
		defaultOpen: hasHref({ entries: children, href: pathname }) || undefined,
	};
};

const navSeparator: LayoutNavSeparator = { type: 'separator' };

const navFor = ({
	navRoutes,
	pathname,
	href,
	filter,
}: {
	navRoutes: NavRoute[];
	pathname: string;
	href: Href;
	filter: AccessFilter;
}): LayoutNavEntry[] => {
	const childrenOf = (route: NavRoute): LayoutNavSubEntry[] =>
		childrenFor({ children: filter(route.nav.children ?? []), href });

	const visible = navRoutes.filter(
		(route) => route.nav.children === undefined || childrenOf(route).length > 0,
	);

	const sections: NavRoute[][] = [];
	for (const route of visible) {
		const current = sections.at(-1);
		if (current === undefined || route.nav.separator === true) sections.push([route]);
		else current.push(route);
	}

	return sections.flatMap((section, index) => [
		...(index === 0 ? [] : [navSeparator]),
		...grouped({
			items: section,
			groupOf: (route) => route.nav.group,
			toItem: (route) => itemFor({ route, pathname, href, children: childrenOf(route) }),
		}),
	]);
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
	return route.access ? (
		<RequireAccess access={route.access}>
			<Page />
		</RequireAccess>
	) : (
		<Page />
	);
};

const guardedElementFor = (route: AppRoute) => {
	const page = elementFor(route);

	if (route.layout === 'shell') return page;
	if (route.audience === 'anonymous')
		return <RedirectIfAuthenticated>{page}</RedirectIfAuthenticated>;
	if (route.audience === 'authenticated') return <RequireAuth>{page}</RequireAuth>;
	return page;
};

const routeObjectFor = (route: AppRoute): RouteObject =>
	route.path === undefined
		? { index: true, element: guardedElementFor(route) }
		: { path: route.path, element: guardedElementFor(route) };

const shellRoutes = routes.filter((route): route is ShellRoute => route.layout === 'shell');
const bareRoutes = routes.filter((route) => route.layout === 'bare');
const navRoutes = shellRoutes.filter((route): route is NavRoute => route.nav !== undefined);

const WorkspaceEntry = () => {
	const { workspace } = useAuth();
	if (workspace === null) return null;

	return <Navigate to={workspaceHref({ slug: workspace.slug, path: 'overview' })} replace />;
};

const AuthorizedShell = () => {
	const { workspace, filter } = useAuth();
	const { pathname } = useLocation();

	const current = workspace?.slug ?? '';
	const nav = useMemo(
		() =>
			navFor({
				navRoutes: filter(navRoutes),
				pathname,
				href: (path) => workspaceHref({ slug: current, path }),
				filter,
			}),
		[current, filter, pathname],
	);

	return <AppShell nav={nav} />;
};

const shell = (
	<RequireAuth>
		<AuthorizedShell />
	</RequireAuth>
);

const router = createBrowserRouter([
	{
		element: shell,
		children: [
			{ index: true, element: <WorkspaceEntry /> },
			{
				path: ':slug',
				element: <WorkspaceScope />,
				children: [
					{ index: true, element: <Navigate to="overview" replace /> },
					...shellRoutes.flatMap((route): RouteObject[] =>
						route.path === undefined ? [] : [{ path: route.path, element: elementFor(route) }],
					),
				],
			},
		],
	},
	...bareRoutes.map(routeObjectFor),
	{ path: '*', element: <NotFoundPage /> },
]);

export const Routes = () => <RouterProvider router={router} />;
