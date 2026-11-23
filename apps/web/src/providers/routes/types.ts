import type { AccessCondition } from '@lumo/shared';
import type { ComponentType } from 'react';

export type RouteAudience = 'public' | 'authenticated' | 'anonymous';

export type NavEntry = {
	group: string;
	label: string;
	icon?: ComponentType;
};

type Layout = { layout: 'shell' } | { layout: 'bare'; audience: RouteAudience };

export type AppRoute = Layout & {
	path?: string;
	page: ComponentType;
	access?: AccessCondition;
	nav?: NavEntry;
};
