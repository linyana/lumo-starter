import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ScrollAreaRootProps = ComponentProps<typeof BaseScrollArea.Root>;

/**
 * Sizes the viewport has no say in: it always fills the root, so the area scrolls only once the
 * caller gives the root a height it can run out of.
 */
export function ScrollAreaRoot({ className, ...props }: ScrollAreaRootProps) {
	return (
		<BaseScrollArea.Root
			data-slot="scroll-area-root"
			className={cn('relative min-h-0 overflow-hidden', className)}
			{...props}
		/>
	);
}
