import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

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
		className?: string;
	};

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
