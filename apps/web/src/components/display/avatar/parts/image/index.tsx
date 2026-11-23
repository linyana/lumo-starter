import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AvatarImageProps = Omit<ComponentProps<typeof BaseAvatar.Image>, 'className'> & {
	className?: string;
};

export function AvatarImage({ className, ...props }: AvatarImageProps) {
	return (
		<BaseAvatar.Image
			data-slot="avatar-image"
			className={cn(
				'size-full object-cover',
				'transition-opacity duration-(--duration-state)',
				'data-starting-style:opacity-0 data-ending-style:opacity-0',
				className,
			)}
			{...props}
		/>
	);
}
