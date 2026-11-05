# switch

> A track and a knob, on or off, in the space of one line of text. Two spans, no glyph, and a flag Base UI writes on both of them.

## install

```bash
bunx shadcn@latest add @lumo/switch
```

- payload: `/r/switch.json`
- docs page: `/switch`
- comes with it: `@lumo/utils`
- npm packages: `@base-ui/react`
- lands in: `switch.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/switch.tsx

```tsx
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = Omit<ComponentProps<typeof BaseSwitch.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The track. Base UI writes `data-checked` on it and on the thumb, so the look of the whole
 * control is one selector away at either end.
 *
 * Off, the track is the field's own edge and moves like one: one step darker under the pointer, one
 * step darker in focus, and no outline. On, it is already `--primary` and there is no darker step
 * left to take, so it keeps the ring — a filled track has nothing else to say with colour.
 */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseSwitch.Root
			data-slot="switch"
			className={cn(
				'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5',
				'bg-input transition-colors duration-(--duration-state)',
				'hover:not-disabled:not-data-disabled:not-data-checked:bg-input-strong',
				'not-data-checked:focus-visible:bg-input-strong',
				'not-data-checked:focus-visible:outline-none',
				'data-checked:bg-primary',
				'data-disabled:cursor-not-allowed data-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export type ThumbProps = Omit<ComponentProps<typeof BaseSwitch.Thumb>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The knob. It travels the track's inner width — 36 less the padding and its own 16. */
export function Thumb({ className, ...props }: ThumbProps) {
	return (
		<BaseSwitch.Thumb
			data-slot="switch-thumb"
			className={cn(
				'pointer-events-none block size-4 rounded-full bg-background shadow-sm',
				'transition-transform duration-(--duration-state) ease-(--ease-spring)',
				'data-checked:translate-x-4',
				className,
			)}
			{...props}
		/>
	);
}

/** A track and a knob: on or off, in the space of one line of text. */
export const Switch = { Root, Thumb };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Switch/demos/basic.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

export default function Basic() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-4">
			<Field.Root>
				<Field.Item className="items-center justify-between gap-4">
					<div className="space-y-0.5">
						<Field.Label>preview builds</Field.Label>
						<Field.Description>one for every pull request.</Field.Description>
					</div>
					<Switch.Root name="preview" defaultChecked>
						<Switch.Thumb />
					</Switch.Root>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item className="items-center justify-between gap-4">
					<div className="space-y-0.5">
						<Field.Label>failure mail</Field.Label>
						<Field.Description>
							one a day at most, however many builds fall over.
						</Field.Description>
					</div>
					<Switch.Root name="mail">
						<Switch.Thumb />
					</Switch.Root>
				</Field.Item>
			</Field.Root>
		</div>
	);
}
```

### src/pages/Switch/demos/states.tsx

```tsx
import { Field } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

export default function States() {
	return (
		<div className="flex w-full max-w-sm flex-col gap-3">
			<Field.Root>
				<Field.Item className="items-center justify-between gap-4">
					<Field.Label>off</Field.Label>
					<Switch.Root name="off">
						<Switch.Thumb />
					</Switch.Root>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item className="items-center justify-between gap-4">
					<Field.Label>on</Field.Label>
					<Switch.Root name="on" defaultChecked>
						<Switch.Thumb />
					</Switch.Root>
				</Field.Item>
			</Field.Root>
			<Field.Root>
				<Field.Item className="items-center justify-between gap-4">
					<Field.Label>read only — on, and staying on</Field.Label>
					<Switch.Root name="readonly" defaultChecked readOnly>
						<Switch.Thumb />
					</Switch.Root>
				</Field.Item>
			</Field.Root>
			<Field.Root disabled>
				<Field.Item className="items-center justify-between gap-4">
					<Field.Label>disabled</Field.Label>
					<Switch.Root name="disabled">
						<Switch.Thumb />
					</Switch.Root>
				</Field.Item>
			</Field.Root>
		</div>
	);
}
```
