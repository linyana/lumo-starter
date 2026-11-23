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
	trigger?: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	children?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm?: () => void;
	destructive?: boolean;
	className?: string;
	classNames?: SlotClassNames<AlertDialogSlots>;
};
