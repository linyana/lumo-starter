import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ScrollAreaThumb } from '../thumb';

export type ScrollAreaScrollbarProps = ComponentProps<typeof BaseScrollArea.Scrollbar>;

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
