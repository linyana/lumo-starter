# toggle

> A control that stays where it was put: one setting spelled as a control rather than an action. Being on is the tint the pointer leaves, kept — the surface never changes colour between the two states, only the layer over it does.

## install

```bash
bunx shadcn@latest add @lumo/toggle
```

- payload: `/r/toggle.json`
- docs page: `/toggle`
- comes with it: `@lumo/utils`, `@lumo/control`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `toggle.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/toggle.tsx

```tsx
import { Toggle as BaseToggle, type ToggleProps as BaseToggleProps } from '@base-ui/react/toggle';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { iconSlot, stateLayer } from '@/lib/control';

/** The two tiers: one that is only there once it is on, and one that is drawn either way. */
export type ToggleVariant = 'ghost' | 'outline';
export type ToggleSize = 'sm' | 'md' | 'lg' | 'icon';

/**
 * A control that stays where it was put — one setting spelled as a control, not an action.
 *
 * Being on is the tint the pointer leaves, kept: arriving is a hover, and staying is that same tint
 * made lasting. So the surface never changes colour between the two states, the layer over it does,
 * and a toggle that is both on and pointed at takes the one step between hover and press rather than
 * going still. There is no downward nudge on the press the way `Button` has one: a toggle has
 * already answered the press by staying pressed, and answering twice would read as unsure.
 */
export const toggleVariants = tv({
	base: [
		'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap',
		'relative rounded-md font-medium select-none',
		'transition-[color,background-color,border-color]',
		'ease-(--ease-spring) duration-(--duration-state)',
		stateLayer,
		'data-pressed:after:opacity-(--state-layer-hover-opacity)',
		'data-pressed:hover:after:opacity-(--state-layer-selected-hover-opacity)',
		'data-pressed:active:after:opacity-(--state-layer-pressed-opacity)',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		iconSlot,
	],
	variants: {
		variant: {
			ghost: 'bg-transparent',
			outline: 'border bg-background',
		},
		size: {
			sm: 'h-8 gap-1.5 px-3 text-sm',
			md: 'h-9 px-4 text-sm',
			lg: 'h-10 px-6 text-base',
			icon: 'size-9 text-sm',
		},
	},
	defaultVariants: {
		variant: 'ghost',
		size: 'md',
	},
});

export type ToggleProps<Value extends string = string> = Omit<BaseToggleProps<Value>, 'className'> &
	VariantProps<typeof toggleVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * A button with a memory. Inside a `ToggleGroup` the group reads and writes the state instead, which
 * is why the value it is known by there is passed as `value`; on its own it is `pressed`.
 */
export function Toggle<Value extends string>({
	className,
	variant = 'ghost',
	size = 'md',
	...props
}: ToggleProps<Value>) {
	return (
		<BaseToggle
			data-slot="toggle"
			data-variant={variant}
			data-size={size}
			className={cn(toggleVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Toggle/demos/basic.tsx

```tsx
import { Bell, Pin } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

/**
 * Two tiers, two states: `ghost` is a word until it is on, `outline` is drawn either way. Its glyph
 * is an ordinary child, so it takes its size from the text beside it.
 */
export default function Basic() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Toggle defaultPressed>
				<Pin />
				pinned
			</Toggle>
			<Toggle>
				<Bell />
				notify me
			</Toggle>
			<Toggle variant="outline" defaultPressed>
				public
			</Toggle>
			<Toggle variant="outline">archived</Toggle>
		</div>
	);
}
```

### src/pages/Toggle/demos/icon.tsx

```tsx
import { Bold, Italic, Pin } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

/** A glyph alone keeps its name in `aria-label`; `icon` is the square that holds it. */
export default function Icon() {
	return (
		<div className="flex items-center gap-2">
			<Toggle size="icon" aria-label="pin">
				<Pin />
			</Toggle>
			<Toggle size="icon" aria-label="bold" defaultPressed>
				<Bold />
			</Toggle>
			<Toggle variant="outline" size="icon" aria-label="italic">
				<Italic />
			</Toggle>
		</div>
	);
}
```

### src/pages/Toggle/demos/states.tsx

```tsx
import { Toggle } from '@/components/ui/toggle';

/** Off, on, and the two that cannot be changed: one is dimmed, the other keeps its tint dimmed. */
export default function States() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Toggle>off</Toggle>
			<Toggle defaultPressed>on</Toggle>
			<Toggle variant="outline" disabled>
				disabled
			</Toggle>
			<Toggle variant="outline" disabled defaultPressed>
				on, and disabled
			</Toggle>
		</div>
	);
}
```
