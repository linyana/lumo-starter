import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderValueProps = Omit<ComponentProps<typeof BaseSlider.Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The number, formatted by Base UI from the same values the thumbs are on — a range reads `20 – 70`.
 * Tabular figures and a right edge, so a thumb being dragged does not shift the layout it is
 * dragging beside.
 */
export function SliderValue({ className, ...props }: SliderValueProps) {
	return (
		<BaseSlider.Value
			data-slot="slider-value"
			className={cn('text-right text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		/>
	);
}
