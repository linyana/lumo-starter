import { Children, useMemo, type ComponentProps, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { StepIndexContext, StepsContext } from '../context';

export type StepsVariant = 'numbered' | 'dot';

export const stepsRootVariants = tv({
	base: ['flex list-none'],
	variants: {
		orientation: {
			// No gap between items: each one's connector runs into the next one's box, up to the
			// centre of its circle, so the items are what the space is made of.
			horizontal: 'flex-row items-start',
			vertical: 'flex-col',
		},
		size: {
			// The one number the whole component measures from: the circle's box and, through it,
			// where the connector starts. Everything else sizes itself in `em` from the type.
			sm: 'text-xs [--steps-indicator:calc(var(--spacing)*6)]',
			md: 'text-sm [--steps-indicator:calc(var(--spacing)*7)]',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
		size: 'md',
	},
});

export type StepsRootProps = Omit<ComponentProps<'ol'>, 'children'> &
	VariantProps<typeof stepsRootVariants> & {
		current?: number;
		variant?: StepsVariant;
		children?: ReactNode;
	};

/**
 * The list itself. It owns the order, so an item reads its position from here rather than being
 * told one — items have to be direct children for that to hold.
 */
export function StepsRoot({
	className,
	current,
	orientation = 'horizontal',
	size = 'md',
	variant = 'numbered',
	children,
	...props
}: StepsRootProps) {
	const context = useMemo(
		() => ({ current, orientation, size, variant }),
		[current, orientation, size, variant],
	);

	return (
		<StepsContext.Provider value={context}>
			<ol
				data-slot="steps"
				data-orientation={orientation}
				data-size={size}
				data-variant={variant}
				className={cn(stepsRootVariants({ orientation, size }), className)}
				{...props}
			>
				{Children.map(children, (child, index) => (
					<StepIndexContext.Provider value={index}>{child}</StepIndexContext.Provider>
				))}
			</ol>
		</StepsContext.Provider>
	);
}
