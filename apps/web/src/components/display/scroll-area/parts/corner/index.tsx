import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ComponentProps } from 'react';

export type ScrollAreaCornerProps = ComponentProps<typeof BaseScrollArea.Corner>;

export function ScrollAreaCorner({ className, ...props }: ScrollAreaCornerProps) {
	return <BaseScrollArea.Corner data-slot="scroll-area-corner" className={className} {...props} />;
}
