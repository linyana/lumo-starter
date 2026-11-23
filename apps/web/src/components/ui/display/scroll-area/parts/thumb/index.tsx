import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ScrollAreaThumbProps = ComponentProps<typeof BaseScrollArea.Thumb>;

export function ScrollAreaThumb({ className, ...props }: ScrollAreaThumbProps) {
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
