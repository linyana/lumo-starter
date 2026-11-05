# collapsible

> Disclosure region that expands and collapses one panel. Its height belongs to Transition, so a fold is one box on the one size spring rather than two animations of the same edge. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/collapsible
```

- payload: `/r/collapsible.json`
- docs page: `/collapsible`
- comes with it: `@lumo/utils`, `@lumo/transition`, `@lumo/control`
- npm packages: `@base-ui/react`, `lucide-react`
- lands in: `collapsible.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/collapsible.tsx

```tsx
import { ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { cn } from '@/lib/utils';
import { caret, iconSlot, stateLayer } from '@/lib/control';
import { Transition } from './transition';

export type IconProps = ComponentProps<typeof ChevronRight>;

/** Caret that turns with the panel. Reads `data-panel-open` off the trigger. */
export function Icon({ className, ...props }: IconProps) {
	return (
		<ChevronRight
			data-slot="collapsible-icon"
			aria-hidden="true"
			className={cn(caret, className)}
			{...props}
		/>
	);
}

export type PanelProps = Omit<ComponentProps<typeof BaseCollapsible.Panel>, 'className'> & {
	/**
	 * The height the closed panel keeps, in pixels, so a folded body can still show a peek of
	 * itself. `0` means closed is out of the layout rather than short.
	 */
	peek?: number;
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The height belongs to `Transition`: one box, gliding between the peek it is closed to and the
 * size its body takes, on the library's one size spring. There is no second animation underneath it
 * to disagree — a fold that eased to `auto` and also followed its content would be two measurements
 * of the same box, and the content swapping while it opens would be followed twice.
 *
 * Base UI still measures and owns the panel — its id, the trigger's `aria-controls`, the state
 * attributes. Only `hidden` is taken off it, because a panel that is never in the layout cannot be
 * animated between two heights; `inert` keeps the closed one out of the way instead.
 */
export function Panel({ className, peek = 0, children, ...props }: PanelProps) {
	return (
		<BaseCollapsible.Panel
			keepMounted
			render={({ hidden, ...panelProps }, state) => (
				<div
					{...panelProps}
					data-slot="collapsible-panel"
					inert={!state.open}
					className={cn('overflow-clip', className)}
				>
					<Transition height={state.open ? undefined : peek}>{children}</Transition>
				</div>
			)}
			{...props}
		/>
	);
}

export const Root = BaseCollapsible.Root;

export type TriggerProps = ComponentProps<typeof BaseCollapsible.Trigger>;

export function Trigger({ className, ...props }: TriggerProps) {
	return (
		<BaseCollapsible.Trigger
			data-slot="collapsible-trigger"
			className={cn(
				'group relative flex w-full cursor-pointer items-center justify-between gap-2',
				'rounded-md px-3 py-2 text-left text-sm font-medium select-none',
				stateLayer,
				'data-disabled:pointer-events-none data-disabled:opacity-50',
				iconSlot,
				className,
			)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Collapsible = { Root, Trigger, Icon, Panel };
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Collapsible/demos/basic.tsx

```tsx
import { Collapsible } from '@/components/ui/collapsible';

const keys = ['alien-bean-pasta', 'wild-irish-burrito', 'horse-battery-staple'];

export default function Basic() {
	return (
		<Collapsible.Root className="w-full max-w-sm rounded-lg border">
			<Collapsible.Trigger>
				recovery keys
				<Collapsible.Icon />
			</Collapsible.Trigger>
			<Collapsible.Panel>
				<div className="flex flex-col gap-1 px-3 pt-3 pb-3 font-mono text-sm text-muted-foreground">
					{keys.map((key) => (
						<div key={key}>{key}</div>
					))}
				</div>
			</Collapsible.Panel>
		</Collapsible.Root>
	);
}
```

### src/pages/Collapsible/demos/swapped.tsx

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible } from '@/components/ui/collapsible';

const bodies = {
	short: { label: 'one key', lines: ['alien-bean-pasta'] },
	long: {
		label: 'all of them',
		lines: [
			'alien-bean-pasta',
			'wild-irish-burrito',
			'horse-battery-staple',
			'quiet-ceramic-lamp',
		],
	},
};

/** The panel stays open while the body is replaced, so the box eases from one size to the other. */
export default function Swapped() {
	const [mode, setMode] = useState<keyof typeof bodies>('short');
	const body = bodies[mode];

	return (
		<div className="w-full max-w-sm space-y-2">
			<div className="flex gap-1">
				{(Object.keys(bodies) as (keyof typeof bodies)[]).map((key) => (
					<Button
						key={key}
						size="sm"
						variant={key === mode ? 'secondary' : 'ghost'}
						onClick={() => setMode(key)}
					>
						{bodies[key].label}
					</Button>
				))}
			</div>
			<Collapsible.Root defaultOpen className="rounded-lg border">
				<Collapsible.Trigger>
					recovery keys
					<Collapsible.Icon />
				</Collapsible.Trigger>
				<Collapsible.Panel>
					<div className="flex flex-col gap-1 px-3 pt-3 pb-3 font-mono text-sm text-muted-foreground">
						{body.lines.map((line) => (
							<div key={line}>{line}</div>
						))}
					</div>
				</Collapsible.Panel>
			</Collapsible.Root>
		</div>
	);
}
```
