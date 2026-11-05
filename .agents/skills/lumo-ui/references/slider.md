# slider

> A setting that is a number on a line: a groove, what is already taken of it, and the knob you drag. One thumb or two, horizontal or vertical, and a hidden input inside the thumb so a form and a screen reader both see a value.

## install

```bash
bunx shadcn@latest add @lumo/slider
```

- payload: `/r/slider.json`
- docs page: `/slider`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `slider.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/slider.tsx

```tsx
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
		<BaseSlider.Label
			data-slot="slider-label"
			className={cn('text-sm', className)}
			{...props}
		/>
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
export const Slider = { Root, Label, Value, Control, Track, Indicator, Thumb };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Slider/demos/basic.tsx

```tsx
import { Slider } from '@/components/ui/slider';

export default function Basic() {
	return (
		<div className="w-full max-w-sm">
			<Slider.Root defaultValue={64}>
				<Slider.Label>thumbnail size</Slider.Label>
				<Slider.Value />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</div>
	);
}
```

### src/pages/Slider/demos/range.tsx

```tsx
import { Slider } from '@/components/ui/slider';

/**
 * Two thumbs on one groove: the value is an array, one entry per thumb, and each thumb is given its
 * own name because a range is two numbers a screen reader has to tell apart.
 */
export default function Range() {
	return (
		<div className="w-full max-w-sm">
			<Slider.Root
				defaultValue={[180, 720]}
				min={0}
				max={1000}
				step={10}
				format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
			>
				<Slider.Label>monthly budget</Slider.Label>
				<Slider.Value />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb index={0} aria-label="least" />
						<Slider.Thumb index={1} aria-label="most" />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</div>
	);
}
```

### src/pages/Slider/demos/states.tsx

```tsx
import { Slider } from '@/components/ui/slider';

/** A disabled slider is dimmed and stops taking the pointer; a stepped one only lands on multiples. */
export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<Slider.Root defaultValue={40} step={25}>
				<Slider.Label>brightness, in quarters</Slider.Label>
				<Slider.Value />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
			<Slider.Root defaultValue={90} disabled>
				<Slider.Label>contrast, fixed by the device</Slider.Label>
				<Slider.Value />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</div>
	);
}
```

### src/pages/Slider/demos/vertical.tsx

```tsx
import { Slider } from '@/components/ui/slider';

/**
 * A column instead of a row. Everything is the same control turned on its side; only the height has
 * to be given with it, and a width to sit the name and the number in, because a column has neither.
 */
export default function Vertical() {
	return (
		<div className="flex items-start gap-8">
			<Slider.Root orientation="vertical" defaultValue={70} className="h-40 w-24">
				<Slider.Label>bass</Slider.Label>
				<Slider.Value />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
			<Slider.Root orientation="vertical" defaultValue={35} className="h-40 w-24">
				<Slider.Label>treble</Slider.Label>
				<Slider.Value />
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
						<Slider.Thumb />
					</Slider.Track>
				</Slider.Control>
			</Slider.Root>
		</div>
	);
}
```
