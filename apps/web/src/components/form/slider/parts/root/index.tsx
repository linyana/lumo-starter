import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderRootProps = Omit<ComponentProps<typeof BaseSlider.Root>, 'className'> & {
	className?: string;
};

export function SliderRoot({ className, ...props }: SliderRootProps) {
	return (
		<BaseSlider.Root
			data-slot="slider"
			className={cn('grid w-full grid-cols-2 grid-rows-[auto_1fr] gap-y-3', className)}
			{...props}
		/>
	);
}
