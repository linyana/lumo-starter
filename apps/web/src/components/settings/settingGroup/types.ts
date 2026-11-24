import type { ReactNode } from 'react';

export type SettingsGroupItem = {
	title: ReactNode;
	description?: ReactNode;
	content: ReactNode;
};

export type SettingsGroupProps = {
	title?: ReactNode;
	items: readonly SettingsGroupItem[];
	className?: string;
};
