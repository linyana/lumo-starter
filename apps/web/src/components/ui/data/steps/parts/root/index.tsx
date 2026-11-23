import { Children, useMemo, type ComponentProps, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { StepIndexContext, StepsContext } from '../context';

export type StepsVariant = 'numbered' | 'dot';

export const stepsRootVariants = tv({
	base: ['flex list-none'],
	variants: {
		orientation: {
			horizontal: 'flex-row items-start',
			vertical: 'flex-col',
		},
		size: {
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
