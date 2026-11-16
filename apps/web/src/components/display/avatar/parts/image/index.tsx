import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AvatarImageProps = Omit<ComponentProps<typeof BaseAvatar.Image>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The picture, cropped to the circle. It arrives as a fade rather than as a flash: Base UI keeps the
 * fallback until the image has decoded, so the initials are already there when it lands.
 */
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
