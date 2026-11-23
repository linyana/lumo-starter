import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderLabelProps = Omit<ComponentProps<typeof BaseSlider.Label>, 'className'> & {
	className?: string;
};

export function SliderLabel({ className, ...props }: SliderLabelProps) {
	return (
		<BaseSlider.Label data-slot="slider-label" className={cn('text-sm', className)} {...props} />
	);
}
