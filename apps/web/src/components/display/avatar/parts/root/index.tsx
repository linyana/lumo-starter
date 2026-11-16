import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

/** Three sizes, because an avatar is drawn at the size of the row it sits in and nowhere else. */
export const avatarVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center overflow-hidden align-middle',
		'rounded-full bg-muted text-muted-foreground',
		'leading-none font-medium select-none',
		iconSlot,
	],
	variants: {
		size: {
			sm: 'size-6 text-xs',
			md: 'size-8 text-sm',
			lg: 'size-10 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type AvatarRootProps = Omit<ComponentProps<typeof BaseAvatar.Root>, 'className'> &
	VariantProps<typeof avatarVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The circle itself. Base UI decides which of the two children is drawn — the image while it loads
 * and once it has, the fallback when there is none or it failed — so neither is conditional here.
 */
export function AvatarRoot({ className, size = 'md', ...props }: AvatarRootProps) {
	return (
		<BaseAvatar.Root
			data-slot="avatar"
			data-size={size}
			className={cn(avatarVariants({ size }), className)}
			{...props}
		/>
	);
}
