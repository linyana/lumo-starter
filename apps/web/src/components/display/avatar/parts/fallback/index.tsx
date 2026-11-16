import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AvatarFallbackProps = Omit<ComponentProps<typeof BaseAvatar.Fallback>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * What is drawn when there is no picture: initials, a glyph, or a count. `delay` is the one thing to
 * reach for — a cached image arrives in a frame, and initials that flashed for that frame would be
 * worse than an empty circle.
 */
export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
	return (
		<BaseAvatar.Fallback
			data-slot="avatar-fallback"
			className={cn('flex size-full items-center justify-center', className)}
			{...props}
		/>
	);
}
