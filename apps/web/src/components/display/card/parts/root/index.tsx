import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';

export const cardVariants = tv({
	base: [
		'group/card flex flex-col',
		'rounded-xl bg-card text-card-foreground shadow-surface',
		// The inline inset every part is drawn at. A variable rather than a class per part, so a
		// header, a body and a footer cannot drift apart, and a part added later is inset too
		// without being told to be.
		'[--card-pad:--spacing(6)]',
	],
	variants: {
		bordered: {
			true: 'border border-border',
		},
		size: {
			sm: 'gap-4 py-4 [--card-pad:--spacing(4)]',
			md: 'gap-6 py-6',
		},
		hoverable: {
			true: [
				// Keep the surface's hairline while adding the hover halo. The cursor is the
				// consumer's: a card is a div, not the link inside it.
				'transition-shadow duration-(--duration-state)',
				'hover:shadow-[var(--shadow-surface),var(--shadow-lifted)]',
			],
		},
	},
	defaultVariants: {
		bordered: false,
		size: 'md',
		hoverable: false,
	},
});

export type CardRootProps = ComponentProps<'div'> & VariantProps<typeof cardVariants>;

/**
 * The surface itself. Its size cascades to the parts: the inset travels as `--card-pad`, and
 * `data-size` is on the DOM for whatever wants to target it from CSS.
 *
 * `hoverable` is the one prop that changes how the card behaves, and it only changes how it looks:
 * the surface owns the hover, so a click target placed anywhere inside it lights the whole tile.
 * A card is a plain div, so a card that is clicked is still the consumer's to build — the prop says
 * "this one is a target", not "this one is a button".
 */
export function CardRoot({
	className,
	size = 'md',
	bordered = false,
	hoverable = false,
	...props
}: CardRootProps) {
	return (
		<div
			data-slot="card"
			data-size={size}
			data-bordered={bordered ? '' : undefined}
			data-hoverable={hoverable ? '' : undefined}
			className={cn(cardVariants({ size, bordered, hoverable }), className)}
			{...props}
		/>
	);
}
