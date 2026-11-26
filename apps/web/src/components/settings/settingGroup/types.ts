import type { ReactNode } from 'react';
import type { CardSurface } from '@/components/ui/display/card/parts';

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
	/** Backdrop the group sits on - forwarded to the underlying card. */
	surface?: CardSurface;
	className?: string;
};
