import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { ModalEscapeHatches } from '@/components/overlay/modal';
import type { SlotClassNames } from '@/components/types';
import type {
	AlertDialogBackdrop,
	AlertDialogPortal,
	AlertDialogRoot,
	AlertDialogViewport,
} from './parts';

type AlertDialogRootProps = ComponentProps<typeof AlertDialogRoot>;

export type AlertDialogSlots =
	| 'backdrop'
	| 'viewport'
	| 'popup'
	| 'content'
	| 'header'
	| 'body'
	| 'title'
	| 'description'
	| 'actions';

export type AlertDialogProps = Omit<AlertDialogRootProps, 'children'> &
	ModalEscapeHatches<
		ComponentProps<typeof AlertDialogPortal>,
		ComponentProps<typeof AlertDialogBackdrop>,
		ComponentProps<typeof AlertDialogViewport>
	> & {
		trigger?: ReactElement;
		onClosed?: () => void;
		title: ReactNode;
		description?: ReactNode;
		children?: ReactNode;
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm?: () => void;
		destructive?: boolean;
		confirmCloses?: boolean;
		pending?: boolean;
		/** Render the dimmed page behind the popup. @default true */
		backdrop?: boolean;
		className?: string;
		classNames?: SlotClassNames<AlertDialogSlots>;
	};
