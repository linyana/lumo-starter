import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';

export const cardVariants = tv({
	base: [
		'group/card flex flex-col',
		'rounded-xl bg-card text-card-foreground shadow-surface',
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
