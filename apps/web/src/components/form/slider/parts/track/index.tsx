import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderTrackProps = Omit<ComponentProps<typeof BaseSlider.Track>, 'className'> & {
	className?: string;
};

export function SliderTrack({ className, ...props }: SliderTrackProps) {
	return (
		<BaseSlider.Track
			data-slot="slider-track"
			className={cn(
				'relative h-1.5 w-full grow rounded-full bg-muted select-none',
				'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
				className,
			)}
			{...props}
		/>
	);
}
