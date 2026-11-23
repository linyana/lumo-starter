import type { AccessCondition } from '@lumo/shared';
import type { ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { MenuPositionerProps } from './parts';

type MenuPlacement = Pick<MenuPositionerProps, 'side' | 'align'>;

export type MenuSlots = 'popup' | 'viewport' | 'item' | 'separator';

export type MenuEntry = {
	separatorBefore?: boolean;
	access?: AccessCondition;
} & (
	| {
			type: 'content';
			content: ReactNode;
	  }
	| {
			type?: 'action';
			label: ReactNode;
			icon?: ReactNode;
			disabled?: boolean;
			destructive?: boolean;
			closeOnClick?: boolean;
			className?: string;
			onClick?: () => void;
	  }
);

export type MenuProps = MenuPlacement & {
	trigger: ReactElement;
	items: MenuEntry[];
	className?: string;
	classNames?: SlotClassNames<MenuSlots>;
};
