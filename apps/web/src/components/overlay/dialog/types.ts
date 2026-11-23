import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { DialogRoot } from './parts';

type DialogRootProps = ComponentProps<typeof DialogRoot>;

export type DialogSlots = 'backdrop' | 'viewport' | 'popup' | 'title' | 'description' | 'footer';

export type DialogProps = Pick<DialogRootProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
	trigger?: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
	footer?: ReactNode;
	disablePointerDismissal?: boolean;
	className?: string;
	classNames?: SlotClassNames<DialogSlots>;
};
