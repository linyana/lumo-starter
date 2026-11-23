import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderControlProps = Omit<ComponentProps<typeof BaseSlider.Control>, 'className'> & {
	className?: string;
};

export function SliderControl({ className, ...props }: SliderControlProps) {
	return (
		<BaseSlider.Control
			data-slot="slider-control"
			className={cn(
				'col-span-2 flex w-full touch-none items-center select-none',
				'data-[orientation=vertical]:w-fit data-[orientation=vertical]:flex-col',
				className,
			)}
			{...props}
		/>
	);
}
