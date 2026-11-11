import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { LumoDialog } from '@/components/ui/dialog';
import type { SlotClassNames } from '../types';

type DialogRootProps = ComponentProps<typeof LumoDialog.Root>;

export type DialogSlots = 'backdrop' | 'viewport' | 'popup' | 'title' | 'description' | 'footer';

export type DialogProps = Pick<DialogRootProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
	/** The element that opens it. It becomes the dialog's trigger. */
	trigger: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
	/** Drawn on the right edge, under the body. */
	footer?: ReactNode;
	/**
	 * Keeps a click on the page behind the panel from closing it. Off by default, which closes it —
	 * set it on a form, where a stray click would throw away what was typed.
	 */
	disablePointerDismissal?: boolean;
	/** The panel itself — the shorthand for `classNames.popup`. */
	className?: string;
	classNames?: SlotClassNames<DialogSlots>;
};
