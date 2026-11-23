import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { ComponentProps, ReactNode } from 'react';
import { toggleMark } from '@/lib/control';
import { cn } from '@/lib/utils';
import './marks.css';

export type CheckboxIndicatorProps = Omit<
	ComponentProps<typeof BaseCheckbox.Indicator>,
	'className' | 'children'
> & {
	className?: string;
	children?: ReactNode;
};

export function CheckboxIndicator({ className, children, ...props }: CheckboxIndicatorProps) {
	return (
		<BaseCheckbox.Indicator
			data-slot="checkbox-indicator"
			keepMounted={children == null}
			className={cn(
				'group/indicator flex items-center justify-center [&_svg]:size-3',
				children != null && [toggleMark, 'data-starting-style:scale-75 data-ending-style:scale-75'],
				className,
			)}
			{...props}
		>
			{children ?? (
				<svg
					aria-hidden
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path data-checkbox-mark="check" d="M4 12l5 5L20 6" pathLength={1} />
					<path data-checkbox-mark="dash" d="M5 12h14" />
				</svg>
			)}
		</BaseCheckbox.Indicator>
	);
}
