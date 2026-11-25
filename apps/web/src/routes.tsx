import {
	LayoutDashboard,
	Settings,
	ScrollText,
	ShieldCheck,
	SlidersHorizontal,
	UserRound,
	Users,
} from 'lucide-react';
import { Navigate } from 'react-router';
import {
	AuditPage,
	DashboardPage,
	LoginPage,
	PreferenceSetting,
	ProfileSetting,
	RegisterPage,
	RolesPage,
	UsersPage,
} from '@/pages';
import type { AppRoute } from '@/providers/routes';

const SettingsIndex = () => <Navigate to="/settings/profile" replace />;

export const routes: AppRoute[] = [
	{
		layout: 'shell',
		page: DashboardPage,
		nav: { group: 'Workspace', label: 'Overview', icon: LayoutDashboard },
	},
	{
		path: 'users',
		layout: 'shell',
		page: UsersPage,
		access: { permission: 'user:read' },
		nav: { group: 'Workspace', label: 'Users', icon: Users },
	},
	{
		path: 'roles',
		layout: 'shell',
		page: RolesPage,
		access: { permission: 'role:read' },
		nav: { group: 'Workspace', label: 'Roles', icon: ShieldCheck },
	},
	{
		path: 'audit',
		layout: 'shell',
		page: AuditPage,
		access: { permission: 'audit:read' },
		nav: { group: 'Workspace', label: 'Audit log', icon: ScrollText },
	},
	{
		path: 'settings',
		layout: 'shell',
		page: SettingsIndex,
		nav: {
			label: 'Settings',
			separator: true,
			icon: Settings,
			children: [
				{
					group: 'Personal',
					label: 'Preference',
					path: 'settings/preference',
					icon: SlidersHorizontal,
				},
				{ group: 'Personal', label: 'Profile', path: 'settings/profile', icon: UserRound },
			],
		},
	},
	{
		path: 'settings/profile',
		layout: 'shell',
		page: ProfileSetting,
	},
	{
		path: 'settings/preference',
		layout: 'shell',
		page: PreferenceSetting,
	},
	{ path: 'login', layout: 'bare', page: LoginPage, audience: 'anonymous' },
	{ path: 'register', layout: 'bare', page: RegisterPage, audience: 'anonymous' },
];
