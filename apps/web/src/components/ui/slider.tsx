import { Slider as BaseSlider } from '@base-ui/react/slider';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = Omit<ComponentProps<typeof BaseSlider.Root>, 'className'> & {
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
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseSlider.Root
			data-slot="slider"
			className={cn('grid w-full grid-cols-2 grid-rows-[auto_1fr] gap-y-3', className)}
			{...props}
		/>
	);
}

export type LabelProps = Omit<ComponentProps<typeof BaseSlider.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** What the number is about. Base UI wires it to the control's own inputs. */
export function Label({ className, ...props }: LabelProps) {
	return (
		<BaseSlider.Label data-slot="slider-label" className={cn('text-sm', className)} {...props} />
	);
}

export type ValueProps = Omit<ComponentProps<typeof BaseSlider.Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The number, formatted by Base UI from the same values the thumbs are on — a range reads `20 – 70`.
 * Tabular figures and a right edge, so a thumb being dragged does not shift the layout it is
 * dragging beside.
 */
export function Value({ className, ...props }: ValueProps) {
	return (
		<BaseSlider.Value
			data-slot="slider-value"
			className={cn('text-right text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		/>
	);
}

export type ControlProps = Omit<ComponentProps<typeof BaseSlider.Control>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The strip a pointer drags along, and the box the thumbs are measured against. A touch that starts
 * here is the slider's rather than the page's, so dragging does not scroll.
 */
export function Control({ className, ...props }: ControlProps) {
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

export type TrackProps = Omit<ComponentProps<typeof BaseSlider.Track>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The groove: the range at its emptiest, in the fill every placeholder in the library is drawn in.
 * Its thickness and the thumb's are the two numbers worth overriding per call site — a slider in a
 * settings row can be thinner than one that is the subject of the page.
 */
export function Track({ className, ...props }: TrackProps) {
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

export type IndicatorProps = Omit<ComponentProps<typeof BaseSlider.Indicator>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The part of the groove already taken: from the start of the range to the thumb, or between two. */
export function Indicator({ className, ...props }: IndicatorProps) {
	return (
		<BaseSlider.Indicator
			data-slot="slider-indicator"
			className={cn('rounded-full bg-primary', className)}
			{...props}
		/>
	);
}

export type ThumbProps = Omit<ComponentProps<typeof BaseSlider.Thumb>, 'className'> & {
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
export function Thumb({ className, ...props }: ThumbProps) {
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

/** A setting that is a number on a line: a groove, what is already taken of it, and the knob. */
export const LumoSlider = { Root, Label, Value, Control, Track, Indicator, Thumb };
