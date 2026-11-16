import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { AlertDialogRoot } from './parts';

type AlertDialogRootProps = ComponentProps<typeof AlertDialogRoot>;

export type AlertDialogSlots =
	| 'backdrop'
	| 'viewport'
	| 'popup'
	| 'title'
	| 'description'
	| 'actions';

export type AlertDialogProps = Pick<
	AlertDialogRootProps,
	'open' | 'defaultOpen' | 'onOpenChange'
> & {
	/**
	 * The element that opens it. It becomes the alert dialog's trigger. Leave it out for a question
	 * asked from somewhere else — a menu row, say — which then drives it through `open` and
	 * `onOpenChange`.
	 */
	trigger?: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	/** More to read between the description and the two buttons. */
	children?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Runs after the dialog has closed itself on confirm. */
	onConfirm?: () => void;
	/** Draws confirm in the destructive tone. */
	destructive?: boolean;
	/** The panel itself — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<AlertDialogSlots>;
};
