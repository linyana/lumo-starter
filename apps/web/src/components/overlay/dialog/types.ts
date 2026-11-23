import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { ModalEscapeHatches } from '@/components/overlay/modal';
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
		/** Render the dimmed page behind the popup. @default true */
		backdrop?: boolean;
		/** Render the × button in the corner. @default true */
		closeButton?: boolean;
		/** Accessible label for the × button. @default 'Close' */
		closeLabel?: string;
		className?: string;
		classNames?: SlotClassNames<DialogSlots>;
	};
