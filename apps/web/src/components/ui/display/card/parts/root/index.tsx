import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';

export const cardVariants = tv({
	base: [
		'group/card flex flex-col',
		'rounded-xl bg-card text-card-foreground',
		'[--card-pad:--spacing(6)]',
	],
	variants: {
		surface: {
			// Backdrop is the gray page surface (`--layout-content`): its lightness already
			// separates the card, so a pale edge is enough.
			gray: 'border border-border-soft',
			// Backdrop is a white panel (dialog, popover) - same color as the card, so the edge
			// has to carry the separation alone.
			white: 'border border-border',
		},
		size: {
			sm: 'gap-4 py-4 [--card-pad:--spacing(4)]',
			md: 'gap-6 py-6',
		},
		hoverable: {
			true: 'transition-[border-color] duration-(--duration-state) hover:border-foreground/15',
		},
	},
	defaultVariants: {
		surface: 'gray',
		size: 'md',
		hoverable: false,
	},
});

export type CardRootProps = ComponentProps<'div'> & VariantProps<typeof cardVariants>;

export function CardRoot({
	className,
	surface = 'gray',
	size = 'md',
	hoverable = false,
	...props
}: CardRootProps) {
	return (
		<div
			data-slot="card"
			data-surface={surface}
			data-size={size}
			data-hoverable={hoverable ? '' : undefined}
			className={cn(cardVariants({ surface, size, hoverable }), className)}
			{...props}
		/>
	);
}
