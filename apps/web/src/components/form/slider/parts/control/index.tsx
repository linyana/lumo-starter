import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderControlProps = Omit<ComponentProps<typeof BaseSlider.Control>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The strip a pointer drags along, and the box the thumbs are measured against. A touch that starts
 * here is the slider's rather than the page's, so dragging does not scroll.
 */
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
