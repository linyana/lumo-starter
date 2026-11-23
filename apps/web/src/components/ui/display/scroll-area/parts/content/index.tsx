import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';

export type ScrollAreaContentProps = ComponentProps<typeof BaseScrollArea.Content>;

export function ScrollAreaContent({ className, ...props }: ScrollAreaContentProps) {
	return (
		<BaseScrollArea.Content data-slot="scroll-area-content" className={className} {...props} />
	);
}
