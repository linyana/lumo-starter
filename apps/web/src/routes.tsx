import { LayoutDashboard, Users } from 'lucide-react';
import { DashboardPage, LoginPage, RegisterPage, UsersPage } from '@/pages';
import type { AppRoute } from '@/providers/routes';

/**
 * Routes as data: no elements, no guards, no router. `providers/routes` turns
 * this table into route objects and the `nav` rows into the rail's entries, which
 * `providers/layout` draws — so adding a screen edits this file and nothing else.
 */

export const routes: AppRoute[] = [
	{
		layout: 'shell',
		page: DashboardPage,
		access: 'authenticated',
		nav: { group: 'Workspace', label: 'Overview', icon: LayoutDashboard },
	},
	{
		path: 'users',
		layout: 'shell',
		page: UsersPage,
		access: 'authenticated',
		permission: 'user:read',
		nav: { group: 'Workspace', label: 'Users', icon: Users },
	},
	{ path: 'login', layout: 'bare', page: LoginPage, access: 'anonymous' },
	{ path: 'register', layout: 'bare', page: RegisterPage, access: 'anonymous' },
];
