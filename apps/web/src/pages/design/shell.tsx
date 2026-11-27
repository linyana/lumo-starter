import { Boxes, FlaskConical, Palette, Ruler } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { Layout, type LayoutNavEntry } from '@/providers/layout';
import { ThemeToggle } from '@/providers/theme';
import { components } from './components/manifest';
import { TokenEditorProvider } from './tokens/editor';
import { ResetOverrides } from './tokens/reset-button';

const componentHref = (name: string): string => `/design/components/${name}`;

const byName = [...components].sort((a, b) => a.name.localeCompare(b.name));

const nav: LayoutNavEntry[] = [
	{
		type: 'item',
		key: 'playground',
		label: 'Playground',
		href: '/design',
		icon: <FlaskConical />,
		render: <NavLink to="/design" end />,
	},
	{
		type: 'item',
		key: 'tokens',
		label: 'Tokens',
		href: '/design/tokens',
		icon: <Palette />,
		render: <NavLink to="/design/tokens" />,
	},
	{
		type: 'item',
		key: 'concepts',
		label: 'Concepts',
		href: '/design/concepts',
		icon: <Ruler />,
		render: <NavLink to="/design/concepts" />,
	},
	{
		type: 'item',
		key: 'components',
		label: 'Components',
		href: '/design/components',
		icon: <Boxes />,
		render: <NavLink to="/design/components" end />,
		defaultOpen: true,
		children: [
			{
				type: 'item',
				key: 'components:overview',
				label: 'Overview',
				href: '/design/components',
				render: <NavLink to="/design/components" end />,
			},
			...byName.map((item) => ({
				type: 'item' as const,
				key: item.name,
				label: item.name,
				href: componentHref(item.name),
				render: <NavLink to={componentHref(item.name)} />,
			})),
		],
	},
];

const keysByHref = (entries: LayoutNavEntry[]): Map<string, string> =>
	new Map(
		entries.flatMap((entry): [string, string][] => {
			if (entry.type === 'separator' || entry.type === 'skeleton') return [];
			if (entry.type === 'group') return [...keysByHref(entry.children)];
			const own: [string, string][] = entry.href === undefined ? [] : [[entry.href, entry.key]];
			return [...own, ...keysByHref(entry.children ?? [])];
		}),
	);

const selectedKeys = keysByHref(nav);

export const DesignShell = ({
	title,
	description,
	actions,
	children,
}: {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
}) => {
	const { pathname } = useLocation();

	return (
		<TokenEditorProvider>
			<Layout
				nav={nav}
				selectedKey={selectedKeys.get(pathname)}
				logo={<img src="/logo.svg" alt="" className="size-5 shrink-0" />}
				title="Design"
				resetScrollKey={pathname}
				footer={
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">dev only</span>
						<div className="ms-auto">
							<ThemeToggle />
						</div>
					</div>
				}
			>
				<Layout.Header
					title={title}
					description={description}
					actions={
						<>
							{actions}
							<ResetOverrides />
						</>
					}
				/>
				<Layout.Content>{children}</Layout.Content>
			</Layout>
		</TokenEditorProvider>
	);
};
