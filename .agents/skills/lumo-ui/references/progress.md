# progress

> How far a task has come: a groove, the fill inside it, and the number that names it, all read from one value. A null value is a third state — the fill sweeps instead of filling, because a bar that sat at zero while it worked would be lying.

## install

```bash
bunx shadcn@latest add @lumo/progress
```

- payload: `/r/progress.json`
- docs page: `/progress`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `progress.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/progress.tsx

```tsx
import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = Omit<ComponentProps<typeof BaseProgress.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The whole bar, laid out as two columns: a label and its value on the first line, the track under
 * both. A caller that wants neither can leave them out and lay the track out itself — the columns
 * the track spans are simply empty.
 */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseProgress.Root
			data-slot="progress"
			className={cn('grid w-full grid-cols-2 gap-y-2', className)}
			{...props}
		/>
	);
}

export type LabelProps = Omit<ComponentProps<typeof BaseProgress.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

export function Label({ className, ...props }: LabelProps) {
	return (
		<BaseProgress.Label
			data-slot="progress-label"
			className={cn('text-sm', className)}
			{...props}
		/>
	);
}

export type ValueProps = Omit<ComponentProps<typeof BaseProgress.Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The number, formatted by Base UI from the same value the bar was given — a percentage unless the
 * call site asks for something else with `format`. Tabular figures, because a running count that
 * changed width would shift the label beside it on every step.
 */
export function Value({ className, ...props }: ValueProps) {
	return (
		<BaseProgress.Value
			data-slot="progress-value"
			className={cn('text-right text-sm text-muted-foreground tabular-nums', className)}
			{...props}
		/>
	);
}

export type TrackProps = Omit<ComponentProps<typeof BaseProgress.Track>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The groove. Its thickness is the one thing worth overriding per call site — `h-1` for a bar in a
 * table row, `h-2` for one that is the subject of the page.
 */
export function Track({ className, ...props }: TrackProps) {
	return (
		<BaseProgress.Track
			data-slot="progress-track"
			className={cn('col-span-2 h-1.5 overflow-hidden rounded-full bg-muted', className)}
			{...props}
		/>
	);
}

export type IndicatorProps = Omit<ComponentProps<typeof BaseProgress.Indicator>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The fill. While the value is known its width is Base UI's — written as a percentage of the track
 * and eased, so a step from one value to the next is a move rather than a jump.
 *
 * When the value is `null` there is no width to draw, so the fill becomes a segment that sweeps the
 * groove on its own: the bar is saying that the work is happening and how much of it is left is not
 * known. The sweep is the theme's `--animate-progress-sweep`; a reader who asked for less motion
 * gets the segment held still at the start of its travel instead.
 */
export function Indicator({ className, ...props }: IndicatorProps) {
	return (
		<BaseProgress.Indicator
			data-slot="progress-indicator"
			className={cn(
				'h-full rounded-full bg-primary',
				'transition-[width] duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-indeterminate:w-2/5 data-indeterminate:animate-progress-sweep',
				'data-indeterminate:motion-reduce:animate-none',
				className,
			)}
			{...props}
		/>
	);
}

/** How far a task has come: a groove, the fill inside it, and the words that name it. */
export const Progress = { Root, Label, Value, Track, Indicator };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Progress/demos/basic.tsx

```tsx
import { Progress } from '@/components/ui/progress';

export default function Basic() {
	return (
		<div className="w-full max-w-sm">
			<Progress.Root value={64}>
				<Progress.Label>importing photos</Progress.Label>
				<Progress.Value />
				<Progress.Track>
					<Progress.Indicator />
				</Progress.Track>
			</Progress.Root>
		</div>
	);
}
```

### src/pages/Progress/demos/states.tsx

```tsx
import { Progress } from '@/components/ui/progress';

export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-6">
			<Progress.Root value={null}>
				<Progress.Label>checking for updates</Progress.Label>
				<Progress.Value />
				<Progress.Track>
					<Progress.Indicator />
				</Progress.Track>
			</Progress.Root>
			<Progress.Root value={35}>
				<Progress.Label>restoring files</Progress.Label>
				<Progress.Value />
				<Progress.Track>
					<Progress.Indicator />
				</Progress.Track>
			</Progress.Root>
			<Progress.Root value={100}>
				<Progress.Label>backup</Progress.Label>
				<Progress.Value />
				<Progress.Track>
					<Progress.Indicator />
				</Progress.Track>
			</Progress.Root>
		</div>
	);
}
```
