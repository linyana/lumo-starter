import type { AccessCondition } from '@lumo/shared';
import type { ComponentType } from 'react';

export type RouteAudience = 'public' | 'authenticated' | 'anonymous';

export type NavChild = {
	group?: string;
	label: string;
	path: string;
	icon?: ComponentType;
	access?: AccessCondition;
};

export type NavEntry = {
	group?: string;
	label: string;
	icon?: ComponentType;
	children?: NavChild[];
	/** Draws a divider above this entry. */
	separator?: boolean;
};

type Layout = { layout: 'shell' } | { layout: 'bare'; audience: RouteAudience };

export type AppRoute = Layout & {
	path?: string;
	page: ComponentType;
	access?: AccessCondition;
	nav?: NavEntry;
};
