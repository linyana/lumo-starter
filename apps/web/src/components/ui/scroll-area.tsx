import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = ComponentProps<typeof BaseScrollArea.Root>;
export type ViewportProps = ComponentProps<typeof BaseScrollArea.Viewport>;
export type ContentProps = ComponentProps<typeof BaseScrollArea.Content>;
export type ScrollbarProps = ComponentProps<typeof BaseScrollArea.Scrollbar>;
export type ThumbProps = ComponentProps<typeof BaseScrollArea.Thumb>;
export type CornerProps = ComponentProps<typeof BaseScrollArea.Corner>;

/**
 * Sizes the viewport has no say in: it always fills the root, so the area scrolls only once the
 * caller gives the root a height it can run out of.
 */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseScrollArea.Root
			data-slot="scroll-area-root"
			className={cn('relative min-h-0 overflow-hidden', className)}
			{...props}
		/>
	);
}

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseScrollArea.Viewport
			data-slot="scroll-area-viewport"
			className={cn('size-full', className)}
			{...props}
		/>
	);
}

export function Content({ className, ...props }: ContentProps) {
	return (
		<BaseScrollArea.Content data-slot="scroll-area-content" className={className} {...props} />
	);
}

/**
 * Drawn over the content, never beside it: Base UI hides the native bar and gives this track its
 * own absolute placement, so the viewport keeps its width whether or not anything overflows. It
 * stays out of sight until the area is scrolled or pointed at — the platform's overlay behaviour,
 * in the theme's colours — and takes no pointer events while hidden. It brings its own thumb, since
 * a track with nothing in it draws nothing.
 */
export function Scrollbar({
	className,
	orientation = 'vertical',
	children,
	...props
}: ScrollbarProps) {
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
			{children ?? <Thumb />}
		</BaseScrollArea.Scrollbar>
	);
}

/** Its length comes from Base UI, as a CSS variable it writes on every scroll — never from here. */
export function Thumb({ className, ...props }: ThumbProps) {
	return (
		<BaseScrollArea.Thumb
			data-slot="scroll-area-thumb"
			className={cn(
				'size-full rounded-full bg-ring transition-colors duration-(--duration-state) ease-linear',
				'hover:bg-muted-foreground',
				className,
			)}
			{...props}
		/>
	);
}

export function Corner({ className, ...props }: CornerProps) {
	return (
		<BaseScrollArea.Corner data-slot="scroll-area-corner" className={className} {...props} />
	);
}

export const ScrollArea = { Root, Viewport, Content, Scrollbar, Thumb, Corner };
