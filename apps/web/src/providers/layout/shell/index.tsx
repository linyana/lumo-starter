import { Bell, CircleUserRound, CreditCard, EllipsisVertical, LogOut } from 'lucide-react';
import { useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Avatar, Button, Menu, Spinner } from '@/components';
import { useGlobal } from '@/hooks';
import { useAuth } from '@/providers/auth';
import { ThemeToggle } from '@/providers/theme';
import { Layout, type LayoutNavEntry } from '../frame';

type IPropsType = {
	nav: LayoutNavEntry[];
};

const keysByHref = (entries: LayoutNavEntry[]): Map<string, string> =>
	new Map(
		entries.flatMap((entry): [string, string][] => {
			if (entry.type === 'separator' || entry.type === 'skeleton') return [];
			if (entry.type === 'group') return [...keysByHref(entry.children)];
			return entry.href === undefined ? [] : [[entry.href, entry.key]];
		}),
	);

export const AppShell = ({ nav }: IPropsType) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, logout } = useAuth();
	const { collapsed, actions } = useGlobal();
	const [loggingOut, setLoggingOut] = useState(false);
	const logoutStarted = useRef(false);

	const handleLogout = async () => {
		if (logoutStarted.current) return;
		logoutStarted.current = true;
		setLoggingOut(true);
		await logout().catch(() => undefined);
		navigate('/login', { replace: true });
	};

	return (
		<Layout
			nav={nav}
			selectedKey={keysByHref(nav).get(location.pathname)}
			logo={<img src="/logo.svg" alt="" className="size-5 shrink-0" />}
			title="Lumo Starter"
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
									<div className="flex items-center gap-3 px-3 py-2">
										<Avatar alt={user.name} shape="square" />
										<div className="flex flex-col items-start">
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-xs text-muted-foreground">{user.email}</p>
										</div>
									</div>
								),
							},
							{
								label: 'Account',
								icon: <CircleUserRound />,
								disabled: true,
								separatorBefore: true,
							},
							{ label: 'Billing', icon: <CreditCard />, disabled: true },
							{ label: 'Notifications', icon: <Bell />, disabled: true },
							{
								label: loggingOut ? 'Logging out…' : 'Log out',
								icon: loggingOut ? <Spinner size={1} label="Logging out" /> : <LogOut />,
								disabled: loggingOut,
								closeOnClick: false,
								separatorBefore: true,
								onClick: () => {
									handleLogout();
								},
							},
						]}
						trigger={
							<Button
								variant="ghost"
								aria-label="Account menu"
								className="p-2 group-data-compact:p-0"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar alt={user.name} shape="square" className="bg-gray-200" />
										<div className="flex flex-col items-start">
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-xs text-muted-foreground">{user.email}</p>
										</div>
									</div>
									<EllipsisVertical className="group-data-compact:hidden" />
								</div>
							</Button>
						}
					/>
				) : null
			}
			brandActions={
				<>
					<ThemeToggle />
				</>
			}
		>
			<Layout.Content>
				<Outlet />
			</Layout.Content>
		</Layout>
	);
};
