import { Check } from 'lucide-react';
import { useContext, type ComponentProps, type ReactNode } from 'react';
import { tv } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { StepIndexContext, StepStatusContext, useSteps } from '../context';
import { StepsIndicator } from '../indicator';
import { StepsSeparator } from '../separator';

export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

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
			horizontal: 'self-center',
			vertical: 'flex-1 pb-6 group-last/step:pb-0',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

export type StepsItemProps = Omit<ComponentProps<'li'>, 'children'> & {
	status?: StepStatus;
	icon?: ReactNode;
	children?: ReactNode;
};

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
