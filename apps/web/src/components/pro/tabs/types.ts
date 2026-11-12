import type { ReactNode } from 'react';
import type { TabsSize, TabsVariant } from '@/components/ui/tabs';
import type { SlotClassNames } from '../types';

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
	/** The tab picked. `value`/`onChange` bind every control here — see `pro/checkbox`'s type. */
	onChange?: (value: string) => void;
	/** `rounded` is the filled track, `square` and `point` the flat rows with a moving edge. */
	variant?: TabsVariant;
	size?: TabsSize;
	className?: string;
	classNames?: SlotClassNames<TabsSlots>;
};
