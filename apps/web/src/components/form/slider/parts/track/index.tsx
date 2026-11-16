import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderTrackProps = Omit<ComponentProps<typeof BaseSlider.Track>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The groove: the range at its emptiest, in the fill every placeholder in the library is drawn in.
 * Its thickness and the thumb's are the two numbers worth overriding per call site — a slider in a
 * settings row can be thinner than one that is the subject of the page.
 */
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
