import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AvatarGroupProps = ComponentProps<'div'>;

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
