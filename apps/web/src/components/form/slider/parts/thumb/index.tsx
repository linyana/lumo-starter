import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SliderThumbProps = Omit<ComponentProps<typeof BaseSlider.Thumb>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The knob, drawn as the box family draws one: the page's own fill inside an edge that steps darker
 * under the pointer. `--input` to `--input-strong` is that step, and focus takes it too.
 *
 * Focus is read off the input Base UI hides inside the thumb, with `:has()` rather than a state
 * attribute, because the two are not the same question: `data-focused` is also true of a thumb that
 * was clicked, and only a reader who arrived by keyboard needs to be told where they are. The input
 * itself is clipped to nothing — it is there to be announced, not drawn — so the theme's outline has
 * no box to sit on, and the edge is what carries the state, exactly as it does on a checkbox.
 *
 * Being dragged is the last step: the edge takes the fill's own colour, and the knob grows a little,
 * so the thing under the finger is visibly the thing the fill ends at.
 */
export function SliderThumb({ className, ...props }: SliderThumbProps) {
	return (
		<BaseSlider.Thumb
			data-slot="slider-thumb"
			className={cn(
				'block size-4 shrink-0 cursor-grab rounded-full select-none',
				'border border-input bg-background shadow-sm',
				'transition-[border-color,scale] duration-(--duration-state) ease-(--ease-spring)',
				'hover:not-data-disabled:border-input-strong',
				'has-[:focus-visible]:border-input-strong',
				'data-dragging:scale-110 data-dragging:border-primary data-dragging:cursor-grabbing',
				'data-disabled:cursor-not-allowed data-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}
