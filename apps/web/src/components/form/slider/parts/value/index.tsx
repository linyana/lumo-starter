import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderValueProps = Omit<ComponentProps<typeof BaseSlider.Value>, 'className'> & {
	className?: string;
};

export function SliderValue({ className, ...props }: SliderValueProps) {
	return (
		<BaseSlider.Value
			data-slot="slider-value"
			className={cn('text-right text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		/>
	);
}
