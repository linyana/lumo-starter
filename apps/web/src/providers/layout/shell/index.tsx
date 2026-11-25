import { ChevronsUpDown, CircleUserRound, EllipsisVertical, LogOut } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { Avatar, Button, Menu, Spinner } from '@/components';
import { useGlobal } from '@/hooks';
import { AccountDialog } from '@/pages/account';
import { useAuth } from '@/providers/auth';
import { Layout, type LayoutNavEntry } from '../frame';

type IPropsType = {
	nav: LayoutNavEntry[];
};

const keysByHref = (entries: LayoutNavEntry[]): Map<string, string> =>
	new Map(
		entries.flatMap((entry): [string, string][] => {
			if (entry.type === 'separator' || entry.type === 'skeleton') return [];
			if (entry.type === 'group') return [...keysByHref(entry.children)];
			const own: [string, string][] = entry.href === undefined ? [] : [[entry.href, entry.key]];
			return [...own, ...keysByHref(entry.children ?? [])];
		}),
	);

export const AppShell = ({ nav }: IPropsType) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, workspace, workspaces, switchWorkspace, logout } = useAuth();
	const { collapsed, actions } = useGlobal();
	const [loggingOut, setLoggingOut] = useState(false);
	const [accountOpen, setAccountOpen] = useState(false);
	const logoutStarted = useRef(false);

	const brand =
		workspace === null ? (
			'Lumo Starter'
		) : workspaces.length > 1 ? (
			<Menu
				side="bottom"
				align="start"
				className="min-w-56"
				trigger={
					<Button
						variant="ghost"
						size="sm"
						className="-ms-2 max-w-full"
						aria-label="Switch workspace"
					>
						<span className="truncate">{workspace.name}</span>
						<ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
					</Button>
				}
				items={workspaces.map((entry) => ({
					label: entry.name,
					disabled: entry.id === workspace.id,
					onClick: () => {
						void switchWorkspace(entry.id).then(() => {
							navigate(`/${entry.slug}/overview`);
						});
					},
				}))}
			/>
		) : (
			<Link to={`/${workspace.slug}/overview`} className="truncate">
				{workspace.name}
			</Link>
		);

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
			title={brand}
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
										<Avatar alt={user.username} shape="square" />
										<div className="flex flex-col items-start">
											<p className="text-sm font-medium">{user.username}</p>
											<p className="text-xs text-muted-foreground">{user.email}</p>
										</div>
									</div>
								),
							},
							{
								label: 'Account',
								icon: <CircleUserRound />,
								separatorBefore: true,
								onClick: () => {
									setAccountOpen(true);
								},
							},
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
										<Avatar alt={user.username} shape="square" className="bg-gray-200" />
										<div className="flex flex-col items-start">
											<p className="text-sm font-medium">{user.username}</p>
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
		>
			<Layout.Content>
				<Outlet />
			</Layout.Content>
			<AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
		</Layout>
	);
};
