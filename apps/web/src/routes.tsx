import { LayoutDashboard, Settings, SlidersHorizontal, UserRound, Users } from 'lucide-react';
import { Navigate } from 'react-router';
import {
	DashboardPage,
	LoginPage,
	PreferenceSetting,
	ProfileSetting,
	RegisterPage,
	AccountsPage,
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
		path: 'accounts',
		layout: 'shell',
		page: AccountsPage,
		access: { permission: 'account:read' },
		nav: { group: 'Workspace', label: 'Accounts', icon: Users },
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
