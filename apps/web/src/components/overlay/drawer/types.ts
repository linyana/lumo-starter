import type { ComponentProps, ReactElement, ReactNode } from 'react';
import type { SlotClassNames } from '@/components/types';
import type { DrawerRoot } from './parts';

type DrawerRootProps = ComponentProps<typeof DrawerRoot>;

/** The edge the panel is anchored to. `down` is a bottom sheet. */
export type DrawerSide = NonNullable<DrawerRootProps['swipeDirection']>;

export type DrawerSlots =
	| 'backdrop'
	| 'viewport'
	| 'popup'
	| 'content'
	| 'title'
	| 'description'
	| 'footer';

/** The panel's own pieces, already wrapped. Each is `null` when the caller gave nothing to draw. */
export type DrawerParts = {
	title: ReactNode;
	description: ReactNode;
	footer: ReactNode;
};

export type DrawerProps = Pick<DrawerRootProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
	trigger: ReactElement;
	title: ReactNode;
	description?: ReactNode;
	/**
	 * A render function owns the panel's layout: it places the parts itself and, standing outside
	 * `DrawerContent`, brings its own padding and scrolling. Everything it does not place is
	 * simply not drawn.
	 */
	children?: ReactNode | ((parts: DrawerParts) => ReactNode);
	/** Drawn on the bottom edge of the panel, past the body. */
	footer?: ReactNode;
	side?: DrawerSide;
	/** The panel itself — the shorthand for `classNames.popup`. */
	className?: string;
	'data-slot'?: string;
	classNames?: SlotClassNames<DrawerSlots>;
};
