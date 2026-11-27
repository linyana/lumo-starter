import { LayoutDashboard, ScrollText, Settings, ShieldCheck, Users } from 'lucide-react';
import {
	AuditPage,
	DashboardPage,
	DesignComponentPage,
	DesignComponentsPage,
	DesignPlaygroundPage,
	DesignTokensPage,
	LoginPage,
	MembersPage,
	RegisterPage,
	RoleFormPage,
	RolesPage,
	SettingsPage,
} from '@/pages';
import type { AppRoute } from '@/providers/routes';

const designRoutes: AppRoute[] = import.meta.env.DEV
	? [
			{ path: 'design', layout: 'bare', audience: 'public', page: DesignPlaygroundPage },
			{ path: 'design/tokens', layout: 'bare', audience: 'public', page: DesignTokensPage },
			{
				path: 'design/components',
				layout: 'bare',
				audience: 'public',
				page: DesignComponentsPage,
			},
			{
				path: 'design/components/:name',
				layout: 'bare',
				audience: 'public',
				page: DesignComponentPage,
			},
		]
	: [];

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
			icon: Settings,
			children: [
				{
					label: 'Members',
					path: 'settings/members',
					icon: Users,
					access: { permission: 'member:read' },
				},
				{
					label: 'Roles',
					path: 'settings/roles',
					icon: ShieldCheck,
					access: { permission: 'role:read' },
				},
				{
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
		path: 'settings/roles/new',
		layout: 'shell',
		page: RoleFormPage,
		access: { permission: 'role:write' },
	},
	{
		path: 'settings/roles/:id',
		layout: 'shell',
		page: RoleFormPage,
		access: { permission: 'role:write' },
	},
	{
		path: 'settings/audit',
		layout: 'shell',
		page: AuditPage,
		access: { permission: 'audit:read' },
	},
	{ path: 'login', layout: 'bare', page: LoginPage, audience: 'anonymous' },
	{ path: 'register', layout: 'bare', page: RegisterPage, audience: 'anonymous' },
	...designRoutes,
];
