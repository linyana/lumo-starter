import { LayoutDashboard, Settings, Users } from 'lucide-react';
import { Navigate } from 'react-router';
import {
	DashboardPage,
	LoginPage,
	PreferenceSetting,
	ProfileSetting,
	RegisterPage,
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
		path: 'settings',
		layout: 'shell',
		page: SettingsIndex,
		nav: {
			group: 'Settings',
			label: 'Settings',
			icon: Settings,
			children: [
				{ label: 'Profile', path: 'settings/profile' },
				{ label: 'Preference', path: 'settings/preference' },
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
