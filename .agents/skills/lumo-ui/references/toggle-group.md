# toggle-group

> A set of toggles that are one control: one of them on at a time, or several, with the arrow keys moving between them and the whole row a single stop in the tab order. The row draws no skin — it owns the space between its items and the tier and scale they are drawn at, and they inherit both.

## install

```bash
bunx shadcn@latest add @lumo/toggle-group
```

- payload: `/r/toggle-group.json`
- docs page: `/toggle-group`
- comes with it: `@lumo/utils`, `@lumo/toggle`
- npm packages: `@base-ui/react`
- lands in: `toggle-group.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/toggle-group.tsx

```tsx
import { ToggleGroup as BaseToggleGroup, type ToggleGroupProps } from '@base-ui/react/toggle-group';
import { createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
	Toggle,
	type ToggleProps,
	type ToggleSize,
	type ToggleVariant,
} from '@/components/ui/toggle';

export type ToggleGroupContextValue = {
	variant: ToggleVariant;
	size: ToggleSize;
};

/** The tier and the scale, which every item of a group shares unless it overrides one. */
export const ToggleGroupContext = createContext<ToggleGroupContextValue>({
	variant: 'ghost',
	size: 'md',
});

export function useToggleGroup() {
	return useContext(ToggleGroupContext);
}

export type RootProps<Value extends string = string> = Omit<ToggleGroupProps<Value>, 'className'> &
	Partial<ToggleGroupContextValue> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The row a set of toggles sits in. Base UI's group is what makes the set one control: one of them
 * is on at a time — or several, with `multiple` — the arrow keys move between them, and the whole
 * row is a single stop in the tab order.
 *
 * The group draws no skin of its own: no frame around the items, no track under them. A toggle
 * already carries its own edge (`outline`) or deliberately none (`ghost`), and a box drawn around a
 * row of boxes is a third edge saying nothing the row does not. What the row does own is the pair of
 * things its items must not disagree about — the space between them, and the tier and scale they are
 * drawn at — so both are set here and inherited. A run of choices that changes a panel is `Tabs`;
 * this is a run that changes a setting.
 */
export function Root<Value extends string>({
	className,
	variant = 'ghost',
	size = 'md',
	...props
}: RootProps<Value>) {
	const context = useMemo(() => ({ variant, size }), [variant, size]);

	return (
		<ToggleGroupContext.Provider value={context}>
			<BaseToggleGroup
				data-slot="toggle-group"
				data-variant={variant}
				data-size={size}
				className={cn(
					'flex w-fit items-center gap-1',
					'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
					className,
				)}
				{...props}
			/>
		</ToggleGroupContext.Provider>
	);
}

export type ItemProps<Value extends string = string> = Omit<
	ToggleProps<Value>,
	'variant' | 'size'
> & {
	/** Overrides the group's tier for this one item, which is rarely what a row wants. */
	variant?: ToggleVariant;
	/** Overrides the group's scale for this one item, which is rarely what a row wants. */
	size?: ToggleSize;
};

/** One toggle of the set. Its `value` is the word the group's state is written in. */
export function Item<Value extends string>({ variant, size, ...props }: ItemProps<Value>) {
	const group = useToggleGroup();

	return (
		<Toggle
			data-slot="toggle-group-item"
			variant={variant ?? group.variant}
			size={size ?? group.size}
			{...props}
		/>
	);
}

/** A set of toggles that are one control, and the row that holds them. */
export const ToggleGroup = { Root, Item };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/ToggleGroup/demos/basic.tsx

```tsx
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { ToggleGroup } from '@/components/ui/toggle-group';

/**
 * One of three. The group holds the value — `left` until something else is pressed — and the arrow
 * keys move between the items, so the row is a single stop in the tab order.
 */
export default function Basic() {
	return (
		<ToggleGroup.Root
			defaultValue={['left']}
			aria-label="alignment"
			size="icon"
			variant="outline"
		>
			<ToggleGroup.Item value="left" aria-label="left">
				<AlignLeft />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="center" aria-label="centre">
				<AlignCenter />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="right" aria-label="right">
				<AlignRight />
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	);
}
```

### src/pages/ToggleGroup/demos/multiple.tsx

```tsx
import { Bold, Italic, Underline } from 'lucide-react';
import { ToggleGroup } from '@/components/ui/toggle-group';

/** `multiple` lets several of them stay down: a set of switches rather than a choice between them. */
export default function Multiple() {
	return (
		<ToggleGroup.Root multiple defaultValue={['bold']} aria-label="formatting" size="icon">
			<ToggleGroup.Item value="bold" aria-label="bold">
				<Bold />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="italic" aria-label="italic">
				<Italic />
			</ToggleGroup.Item>
			<ToggleGroup.Item value="underline" aria-label="underline">
				<Underline />
			</ToggleGroup.Item>
		</ToggleGroup.Root>
	);
}
```

### src/pages/ToggleGroup/demos/sizes.tsx

```tsx
import { ToggleGroup } from '@/components/ui/toggle-group';

/**
 * The tier and the scale are the group's, and the items inherit them — so a row cannot end up with
 * one control drawn at the size of another. `md` is the default.
 */
export default function Sizes() {
	return (
		<div className="flex flex-col items-start gap-3">
			<ToggleGroup.Root size="sm" defaultValue={['day']} aria-label="chart range">
				<ToggleGroup.Item value="day">day</ToggleGroup.Item>
				<ToggleGroup.Item value="week">week</ToggleGroup.Item>
				<ToggleGroup.Item value="month">month</ToggleGroup.Item>
			</ToggleGroup.Root>
			<ToggleGroup.Root size="md" defaultValue={['week']} aria-label="table range">
				<ToggleGroup.Item value="day">day</ToggleGroup.Item>
				<ToggleGroup.Item value="week">week</ToggleGroup.Item>
				<ToggleGroup.Item value="month">month</ToggleGroup.Item>
			</ToggleGroup.Root>
			<ToggleGroup.Root size="lg" defaultValue={['month']} aria-label="log range">
				<ToggleGroup.Item value="day">day</ToggleGroup.Item>
				<ToggleGroup.Item value="week">week</ToggleGroup.Item>
				<ToggleGroup.Item value="month">month</ToggleGroup.Item>
			</ToggleGroup.Root>
			<ToggleGroup.Root disabled defaultValue={['week']} aria-label="frozen range">
				<ToggleGroup.Item value="day">day</ToggleGroup.Item>
				<ToggleGroup.Item value="week">week</ToggleGroup.Item>
				<ToggleGroup.Item value="month">month</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>
	);
}
```
