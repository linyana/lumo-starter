import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ScrollAreaViewportProps = ComponentProps<typeof BaseScrollArea.Viewport>;

export function ScrollAreaViewport({ className, ...props }: ScrollAreaViewportProps) {
	return (
		<BaseScrollArea.Viewport
			data-slot="scroll-area-viewport"
			className={cn('size-full', className)}
			{...props}
		/>
	);
}
