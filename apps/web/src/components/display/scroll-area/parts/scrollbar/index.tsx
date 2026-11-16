import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAreaThumb } from '../thumb';

export type ScrollAreaScrollbarProps = ComponentProps<typeof BaseScrollArea.Scrollbar>;

/**
 * Drawn over the content, never beside it: Base UI hides the native bar and gives this track its
 * own absolute placement, so the viewport keeps its width whether or not anything overflows. It
 * stays out of sight until the area is scrolled or pointed at — the platform's overlay behaviour,
 * in the theme's colours — and takes no pointer events while hidden. It brings its own thumb, since
 * a track with nothing in it draws nothing.
 */
export function ScrollAreaScrollbar({
	className,
	orientation = 'vertical',
	children,
	...props
}: ScrollAreaScrollbarProps) {
	return (
		<BaseScrollArea.Scrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
				'z-10 flex touch-none p-0.5 select-none',
				'opacity-0 transition-opacity duration-(--duration-state) ease-linear',
				'pointer-events-none data-hovering:pointer-events-auto data-scrolling:pointer-events-auto',
				'data-hovering:opacity-100 data-scrolling:opacity-100',
				orientation === 'vertical' ? 'w-2.5 justify-center' : 'h-2.5 flex-col items-center',
				className,
			)}
			{...props}
		>
			{children ?? <ScrollAreaThumb />}
		</BaseScrollArea.Scrollbar>
	);
}
