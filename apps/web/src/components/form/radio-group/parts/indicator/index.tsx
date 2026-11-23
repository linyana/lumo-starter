import { Radio } from '@base-ui/react/radio';
import type { ComponentProps } from 'react';
import { toggleMark } from '@/lib/control';
import { cn } from '@/lib/utils';

export type RadioGroupIndicatorProps = Omit<ComponentProps<typeof Radio.Indicator>, 'className'> & {
	className?: string;
};

export function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
	return (
		<Radio.Indicator
			data-slot="radio-indicator"
			className={cn(
				'size-2 rounded-full bg-primary',
				toggleMark,
				'data-starting-style:scale-50 data-ending-style:scale-50',
				className,
			)}
			{...props}
		/>
	);
}
