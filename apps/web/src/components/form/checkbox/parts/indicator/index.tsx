import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { Check, Minus } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { toggleMark } from '@/lib/control';
import { cn } from '@/lib/utils';

export type CheckboxIndicatorProps = Omit<
	ComponentProps<typeof BaseCheckbox.Indicator>,
	'className' | 'children'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Replaces the tick. The indeterminate dash is drawn for you, so this is for another tick. */
	children?: ReactNode;
};

/**
 * The tick. Mounted only while the box holds a value: Base UI takes it out of the DOM otherwise,
 * which is why the glyph does not need a hidden state of its own.
 */
export function CheckboxIndicator({ className, children, ...props }: CheckboxIndicatorProps) {
	return (
		<BaseCheckbox.Indicator
			data-slot="checkbox-indicator"
			className={cn(
				'group/indicator flex items-center justify-center',
				toggleMark,
				'data-starting-style:scale-75 data-ending-style:scale-75',
				'[&_svg]:size-3',
				className,
			)}
			{...props}
		>
			{children ?? (
				<>
					<Check aria-hidden className="group-data-indeterminate/indicator:hidden" />
					<Minus aria-hidden className="hidden group-data-indeterminate/indicator:block" />
				</>
			)}
		</BaseCheckbox.Indicator>
	);
}
