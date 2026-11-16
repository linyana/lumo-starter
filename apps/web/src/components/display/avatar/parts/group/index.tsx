import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AvatarGroupProps = ComponentProps<'div'>;

/**
 * A row of them, overlapped. Each circle carries the page's own colour as a ring, which is what
 * separates one from the next without drawing a line between them, so the group stays one shape.
 */
export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				'flex items-center -space-x-2',
				'*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
				className,
			)}
			{...props}
		/>
	);
}
