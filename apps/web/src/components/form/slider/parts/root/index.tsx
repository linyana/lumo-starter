import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderRootProps = Omit<ComponentProps<typeof BaseSlider.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The whole control: a name and a value on the first line, the thing they describe under both. The
 * numbers — `min`, `max`, `step`, the value itself — are Base UI's, which is also what turns a
 * pointer's position into one and hands it back.
 *
 * A vertical slider takes its height from the call site (`className="h-40"`), and a width to go with
 * it, because a column has no natural one.
 */
export function SliderRoot({ className, ...props }: SliderRootProps) {
	return (
		<BaseSlider.Root
			data-slot="slider"
			className={cn('grid w-full grid-cols-2 grid-rows-[auto_1fr] gap-y-3', className)}
			{...props}
		/>
	);
}
