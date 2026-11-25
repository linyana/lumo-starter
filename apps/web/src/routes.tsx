import { LayoutDashboard, ScrollText, Settings, ShieldCheck, Users } from 'lucide-react';
import {
	AuditPage,
	DashboardPage,
	LoginPage,
	MembersPage,
	RegisterPage,
	RolesPage,
	SettingsPage,
} from '@/pages';
import type { AppRoute } from '@/providers/routes';

export const routes: AppRoute[] = [
	{
		path: 'overview',
		layout: 'shell',
		page: DashboardPage,
		nav: { label: 'Overview', icon: LayoutDashboard },
	},
	{
		path: 'settings',
		layout: 'shell',
		page: SettingsPage,
		nav: {
			label: 'Settings',
			separator: true,
			icon: Settings,
			children: [
				{
					group: 'Administration',
					label: 'Members',
					path: 'settings/members',
					icon: Users,
					access: { permission: 'member:read' },
				},
				{
					group: 'Administration',
					label: 'Roles',
					path: 'settings/roles',
					icon: ShieldCheck,
					access: { permission: 'role:read' },
				},
				{
					group: 'Administration',
					label: 'Audit log',
					path: 'settings/audit',
					icon: ScrollText,
					access: { permission: 'audit:read' },
				},
			],
		},
	},
	{
		path: 'settings/members',
		layout: 'shell',
		page: MembersPage,
		access: { permission: 'member:read' },
	},
	{
		path: 'settings/roles',
		layout: 'shell',
		page: RolesPage,
		access: { permission: 'role:read' },
	},
	{
		path: 'settings/audit',
		layout: 'shell',
		page: AuditPage,
		access: { permission: 'audit:read' },
	},
	{ path: 'login', layout: 'bare', page: LoginPage, audience: 'anonymous' },
	{ path: 'register', layout: 'bare', page: RegisterPage, audience: 'anonymous' },
];
