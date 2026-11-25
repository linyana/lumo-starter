import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { ModalEscapeHatches } from '@/components/ui/overlay/modal';
import type { SlotClassNames } from '@/components/types';
import type { DialogBackdrop, DialogPortal, DialogRoot, DialogViewport } from './parts';

type DialogRootProps = ComponentProps<typeof DialogRoot>;

export type DialogSlots =
	| 'backdrop'
	| 'viewport'
	| 'popup'
	| 'content'
	| 'header'
	| 'body'
	| 'title'
	| 'description'
	| 'footer'
	| 'close';

export type DialogProps = Omit<DialogRootProps, 'children'> &
	ModalEscapeHatches<
		ComponentProps<typeof DialogPortal>,
		ComponentProps<typeof DialogBackdrop>,
		ComponentProps<typeof DialogViewport>
	> & {
		trigger?: ReactElement;
		onClosed?: () => void;
		title: ReactNode;
		description?: ReactNode;
		children?: ReactNode;
		footer?: ReactNode;
		backdrop?: boolean;
		closeButton?: boolean;
		closeLabel?: string;
		className?: string;
		classNames?: SlotClassNames<DialogSlots>;
	};
