import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderIndicatorProps = Omit<
	ComponentProps<typeof BaseSlider.Indicator>,
	'className'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The part of the groove already taken: from the start of the range to the thumb, or between two. */
export function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
	return (
		<BaseSlider.Indicator
			data-slot="slider-indicator"
			className={cn('rounded-full bg-primary', className)}
			{...props}
		/>
	);
}
