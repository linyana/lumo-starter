import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderIndicatorProps = Omit<
	ComponentProps<typeof BaseSlider.Indicator>,
	'className'
> & {
	className?: string;
};

export function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
	return (
		<BaseSlider.Indicator
			data-slot="slider-indicator"
			className={cn('rounded-full bg-primary', className)}
			{...props}
		/>
	);
}
