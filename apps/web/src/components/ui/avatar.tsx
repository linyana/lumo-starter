import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';

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

export type RootProps = Omit<ComponentProps<typeof BaseAvatar.Root>, 'className'> &
	VariantProps<typeof avatarVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The circle itself. Base UI decides which of the two children is drawn — the image while it loads
 * and once it has, the fallback when there is none or it failed — so neither is conditional here.
 */
export function Root({ className, size = 'md', ...props }: RootProps) {
	return (
		<BaseAvatar.Root
			data-slot="avatar"
			data-size={size}
			className={cn(avatarVariants({ size }), className)}
			{...props}
		/>
	);
}

export type ImageProps = Omit<ComponentProps<typeof BaseAvatar.Image>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The picture, cropped to the circle. It arrives as a fade rather than as a flash: Base UI keeps the
 * fallback until the image has decoded, so the initials are already there when it lands.
 */
export function Image({ className, ...props }: ImageProps) {
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

export type FallbackProps = Omit<ComponentProps<typeof BaseAvatar.Fallback>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * What is drawn when there is no picture: initials, a glyph, or a count. `delay` is the one thing to
 * reach for — a cached image arrives in a frame, and initials that flashed for that frame would be
 * worse than an empty circle.
 */
export function Fallback({ className, ...props }: FallbackProps) {
	return (
		<BaseAvatar.Fallback
			data-slot="avatar-fallback"
			className={cn('flex size-full items-center justify-center', className)}
			{...props}
		/>
	);
}

export type GroupProps = ComponentProps<'div'>;

/**
 * A row of them, overlapped. Each circle carries the page's own colour as a ring, which is what
 * separates one from the next without drawing a line between them, so the group stays one shape.
 */
export function Group({ className, ...props }: GroupProps) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				'flex items-center -space-x-2',
				'[&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-background',
				className,
			)}
			{...props}
		/>
	);
}

/** A face, or the initials standing in for one, and the row a set of them is stacked in. */
export const LumoAvatar = { Root, Image, Fallback, Group };
