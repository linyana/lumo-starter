import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderLabelProps = Omit<ComponentProps<typeof BaseSlider.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** What the number is about. Base UI wires it to the control's own inputs. */
export function SliderLabel({ className, ...props }: SliderLabelProps) {
	return (
		<BaseSlider.Label data-slot="slider-label" className={cn('text-sm', className)} {...props} />
	);
}
