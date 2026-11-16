import { Check } from 'lucide-react';
import { useContext, type ComponentProps, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { StepIndexContext, StepStatusContext, useSteps } from '../context';
import { StepsIndicator } from '../indicator';
import { StepsSeparator } from '../separator';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/** What `current` says about one item, index by index. */
function resolveStatus({
	index,
	current,
}: {
	index: number | undefined;
	current: number | undefined;
}): StepStatus {
	if (index === undefined || current === undefined) return 'wait';
	if (index < current) return 'finish';
	if (index === current) return 'process';
	return 'wait';
}

export const stepsItemVariants = tv({
	base: ['group/step relative flex min-w-0'],
	variants: {
		orientation: {
			// Top-aligned, so a circle sits at the same height in every item however tall its text
			// is — the connector is placed from that height.
			horizontal: 'flex-1 items-start gap-3',
			vertical: 'items-start gap-3',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export const stepsContentVariants = tv({
	base: 'min-w-0',
	variants: {
		orientation: {
			// Beside the circle it hugs its text and centres itself against the circle; the connector
			// after it takes the slack.
			horizontal: 'self-center',
			// The vertical gap between two steps is this padding, so the connector in the item
			// above runs the whole way to the next circle instead of stopping short of it.
			vertical: 'flex-1 pb-6 group-last/step:pb-0',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export type StepsItemProps = Omit<ComponentProps<'li'>, 'children'> & {
	/** Overrides what `current` would say about this item. */
	status?: StepStatus;
	/**
	 * A glyph in place of the number, at the size of the surrounding text. `finish` draws a check
	 * on its own unless one is given here.
	 */
	icon?: ReactNode;
	children?: ReactNode;
};

/**
 * One step: its indicator, its text and the line to the next one. The item states its status on
 * the DOM, and every part inside reads it from there — so a caller styles nothing by hand.
 */
export function StepsItem({ className, status, icon, children, ...props }: StepsItemProps) {
	const { current, orientation } = useSteps();
	const index = useContext(StepIndexContext);
	const resolved = status ?? resolveStatus({ index, current });
	const glyph =
		icon ?? (resolved === 'finish' ? <Check /> : index === undefined ? null : index + 1);

	return (
		<li
			data-slot="steps-item"
			data-status={resolved}
			aria-current={resolved === 'process' ? 'step' : undefined}
			className={cn(stepsItemVariants({ orientation }), className)}
			{...props}
		>
			<StepStatusContext.Provider value={resolved}>
				<StepsIndicator>{glyph}</StepsIndicator>
				<div data-slot="steps-content" className={stepsContentVariants({ orientation })}>
					{children}
				</div>
				<StepsSeparator />
			</StepStatusContext.Provider>
		</li>
	);
}
