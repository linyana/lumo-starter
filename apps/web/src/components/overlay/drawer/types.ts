import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { ModalEscapeHatches } from '@/components/overlay/modal';
import type { SlotClassNames } from '@/components/types';
import type { DrawerBackdrop, DrawerPortal, DrawerRoot, DrawerViewport } from './parts';

type DrawerRootProps = ComponentProps<typeof DrawerRoot>;

export type DrawerSide = NonNullable<DrawerRootProps['swipeDirection']>;

export type DrawerSlots =
	| 'backdrop'
	| 'viewport'
	| 'popup'
	| 'content'
	| 'title'
	| 'description'
	| 'footer';

export type DrawerParts = {
	title: ReactNode;
	description: ReactNode;
	footer: ReactNode;
};

export type DrawerProps = Omit<DrawerRootProps, 'children' | 'swipeDirection'> &
	ModalEscapeHatches<
		ComponentProps<typeof DrawerPortal>,
		ComponentProps<typeof DrawerBackdrop>,
		ComponentProps<typeof DrawerViewport>
	> & {
		trigger: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode | ((parts: DrawerParts) => ReactNode);
	footer?: ReactNode;
	side?: DrawerSide;
	className?: string;
	'data-slot'?: string;
	classNames?: SlotClassNames<DrawerSlots>;
};
