import type { ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { TabsSize, TabsVariant } from './parts';

export type TabItem = {
	value: string;
	label: ReactNode;
	content: ReactNode;
	icon?: ReactNode;
	disabled?: boolean;
};

export type TabsSlots = 'root' | 'list' | 'indicator' | 'tab' | 'panel';

export type TabsProps = {
	items: TabItem[];
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	variant?: TabsVariant;
	size?: TabsSize;
	className?: string;
	classNames?: SlotClassNames<TabsSlots>;
};
