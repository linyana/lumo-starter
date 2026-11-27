import type { ComponentProps } from 'react';
import { tv } from 'tailwind-variants';
import { colorVars, emphasis, iconSlot, type Color, type Emphasis } from '@/lib/control';
import { cn } from '@/lib/utils';

const LOOK = {
	primary: { variant: 'solid', color: 'primary' },
	default: { variant: 'solid', color: 'primary' },
	secondary: { variant: 'solid', color: 'neutral' },
	destructive: { variant: 'soft', color: 'destructive' },
} as const;

export const badgeVariants = tv({
	base: [
		'inline-flex shrink-0 items-center gap-1 align-middle whitespace-nowrap',
		'rounded-md px-1.5 py-0.5',
		'text-xs leading-4 font-medium',
		iconSlot,
	],
	variants: {
		variant: {
			solid: emphasis.solid,
			soft: emphasis.soft,
			outline: emphasis.outline,
			ghost: emphasis.ghost,
			link: emphasis.link,
		},
		color: colorVars,
	},
	defaultVariants: {
		variant: 'solid',
		color: 'primary',
	},
});

export type BadgeProps = ComponentProps<'span'> & {
	variant?: Emphasis | 'primary' | 'default' | 'secondary' | 'destructive';
	color?: Color;
};

export type BadgeVariant = NonNullable<BadgeProps['variant']>;

export function Badge({ className, variant = 'primary', color, ...props }: BadgeProps) {
	const look: { variant: Emphasis; color: Color } | undefined = LOOK[variant as keyof typeof LOOK];
	const emphasisName = look === undefined ? (variant as Emphasis) : look.variant;
	const colorName = color ?? look?.color ?? 'primary';

	return (
		<span
			data-slot="badge"
			data-variant={variant}
			data-color={colorName}
			className={cn(badgeVariants({ variant: emphasisName, color: colorName }), className)}
			{...props}
		/>
	);
}
