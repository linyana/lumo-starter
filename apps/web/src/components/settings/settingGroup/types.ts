import type { ReactNode } from 'react';

export type SettingsGroupWidth = 'auto' | 'control' | 'wide' | 'full';

export type SettingsGroupItem = {
	title: ReactNode;
	description?: ReactNode;
	content: ReactNode;
	width?: SettingsGroupWidth;
};

export type SettingsGroupProps = {
	title?: ReactNode;
	items: readonly SettingsGroupItem[];
	className?: string;
};
