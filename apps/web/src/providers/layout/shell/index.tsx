import { Bell, CircleUserRound, CreditCard, EllipsisVertical, LogOut } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Layout, type LayoutNavEntry } from '../frame';
import { LumoButton } from '@/components/ui/button';
import { useGlobal } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { ThemeToggle } from '@/providers/theme';
import type { AppShellProps } from './types';
import { Avatar, Button, Flex, Menu, Popover } from '@/components';

export type { AppShellProps } from './types';

/** Every row that goes somewhere, by the href it goes to — the rows are the only key map. */
const keysByHref = (entries: LayoutNavEntry[]): Map<string, string> =>
	new Map(
		entries.flatMap((entry): [string, string][] => {
			if (entry.type === 'separator' || entry.type === 'skeleton') return [];
			if (entry.type === 'group') return [...keysByHref(entry.children)];
			return entry.href === undefined ? [] : [[entry.href, entry.key]];
		}),
	);

/**
 * The shell wraps `providers/layout/frame`: the lumo `layout` block, where a rail, a mobile drawer
 * and the scroll box all come with it. Each row is a router link, so the router stays the single
 * source of truth for "where am I" and a click never leaves the document.
 *
 * The rows arrive as a prop: `providers/routes` builds them from the table in `src/routes.tsx`, so
 * a new screen is still one row there and no write here, and this module stays a renderer — it
 * imports the session, never the route table or the pages behind it.
 */
export const AppShell = ({ nav }: AppShellProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const { collapsed, actions } = useGlobal();

	return (
		<Layout
			nav={nav}
			selectedKey={keysByHref(nav).get(location.pathname)}
			logo={<img src="/logo.svg" alt="" className="size-5 shrink-0" />}
			title="Lumo Starter"
			// The rail's width is app state, not shell state: it is remembered between visits, and
			// the shortcut the shell handles goes through the same setter.
			collapsible
			collapsed={collapsed}
			onCollapsedChange={(next) => actions.set({ collapsed: next })}
			resetScrollKey={location.pathname}
			footer={
				user ? (
					<Menu
						side="right"
						className="min-w-64"
						items={[
							{
								type: 'content',
								content: (
									<Flex gap="md" align="center" className="px-3 py-2">
										<Avatar alt={user.name} shape="square" />
										<Flex direction="column" align="start">
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-xs text-muted-foreground">{user.email}</p>
										</Flex>
									</Flex>
								),
							},
							{ label: 'Account', icon: <CircleUserRound />, disabled: true, separatorBefore: true },
							{ label: 'Billing', icon: <CreditCard />, disabled: true },
							{ label: 'Notifications', icon: <Bell />, disabled: true },
							{
								label: 'Log out',
								icon: <LogOut />,
								separatorBefore: true,
								onClick: () => {
									void logout().catch(() => undefined).then(() => navigate('/login', { replace: true }));
								},
							},
						]}
						trigger={
							<Button
								variant="ghost"
								aria-label="Account menu"
								className="p-2 group-data-compact:p-0"
							>
								<Flex justify="between" align="center">
									<Flex gap="md" align="center">
										<Avatar alt={user.name} shape="square" className="bg-gray-200" />
										<Flex direction="column" align="start">
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-xs text-muted-foreground">{user.email}</p>
										</Flex>
									</Flex>
									<EllipsisVertical className="group-data-compact:hidden" />
								</Flex>
							</Button>
						}
					/>
				) : null
			}
			brandActions={
				<>
					<ThemeToggle />
					<LumoButton
						variant="ghost"
						size="icon"
						aria-label="Sign out"
						icon={<LogOut />}
						onClick={async () => {
							// `logout` drops the local session in its own `finally`, so a failed request
							// must not keep the user here: swallow it and leave anyway. Awaiting the
							// `catch` also keeps the rejection from floating.
							await logout().catch(() => undefined);
							navigate('/login', { replace: true });
						}}
					/>
				</>
			}
		>
			<Layout.Content>
				<Outlet />
			</Layout.Content>
		</Layout>
	);
};
