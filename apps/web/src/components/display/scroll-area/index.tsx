import { cn } from '@/lib/utils';
import {
	ScrollAreaContent,
	ScrollAreaRoot,
	ScrollAreaScrollbar,
	ScrollAreaViewport,
} from './parts';
import type { ScrollAreaProps } from './types';

/** A pane that scrolls under the platform's overlay bar, drawn only when there is something to scroll. */
export const ScrollArea = ({
	children,
	height,
	orientation = 'vertical',
	className,
	classNames,
}: ScrollAreaProps) => (
	<ScrollAreaRoot
		className={cn(className, classNames?.root)}
		style={height === undefined ? undefined : { height }}
	>
		<ScrollAreaViewport className={classNames?.viewport}>
			<ScrollAreaContent className={classNames?.content}>{children}</ScrollAreaContent>
		</ScrollAreaViewport>
		{orientation !== 'horizontal' && (
			<ScrollAreaScrollbar orientation="vertical" className={classNames?.scrollbar} />
		)}
		{orientation !== 'vertical' && (
			<ScrollAreaScrollbar orientation="horizontal" className={classNames?.scrollbar} />
		)}
	</ScrollAreaRoot>
);
