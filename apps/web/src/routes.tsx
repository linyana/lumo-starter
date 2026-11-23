import { LayoutDashboard, Users } from 'lucide-react';
import { DashboardPage, LoginPage, RegisterPage, UsersPage } from '@/pages';
import type { AppRoute } from '@/providers/routes';

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
	{ path: 'login', layout: 'bare', page: LoginPage, audience: 'anonymous' },
	{ path: 'register', layout: 'bare', page: RegisterPage, audience: 'anonymous' },
];
