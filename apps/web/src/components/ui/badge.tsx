import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot } from '@/lib/control';

/**
 * A word that labels something it sits beside. The three surface variants are the fills a button
 * already has, because a badge next to a control should read as the same family; the four outcomes
 * are a tint of their own colour rather than a fill, because an outcome is a fact to be read and a
 * solid block would make it look pressable.
 */
export const badgeVariants = tv({
	base: [
		'inline-flex shrink-0 items-center gap-1 align-middle whitespace-nowrap',
		'rounded-sm border border-transparent px-1.5 py-0.5',
		'text-xs leading-4 font-medium',
		iconSlot,
	],
	variants: {
		variant: {
			default: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground',
			outline: 'border-border text-foreground',
			destructive: 'bg-destructive/10 text-destructive',
			success: 'bg-success/10 text-success',
			warning: 'bg-warning/10 text-warning',
			info: 'bg-info/10 text-info',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
	return (
		<span
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}
