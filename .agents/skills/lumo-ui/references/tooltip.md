# tooltip

> Hover and focus hint anchored to its trigger. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/tooltip
```

- payload: `/r/tooltip.json`
- docs page: `/tooltip`
- comes with it: `@lumo/utils`, `@lumo/surface`
- npm packages: `@base-ui/react`
- lands in: `tooltip.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/tooltip.tsx

```tsx
import type { ComponentProps } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { cn } from '@/lib/utils';
import { arrow, popup, positioner, viewport } from '@/lib/surface';

export type ArrowProps = ComponentProps<typeof BaseTooltip.Arrow>;

export function Arrow({ className, ...props }: ArrowProps) {
	return (
		<BaseTooltip.Arrow
			data-slot="tooltip-arrow"
			className={cn(arrow, 'before:bg-primary', className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseTooltip.Popup>;

export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseTooltip.Popup
			data-slot="tooltip-popup"
			className={cn(
				'relative rounded-md bg-primary text-xs',
				'text-primary-foreground shadow-lifted',
				'px-2.5 py-1',
				// A Viewport inside brings its own padding, so this one would double up.
				'has-[>[data-slot=tooltip-viewport]]:p-0',
				'max-w-xs',
				popup,
				className,
			)}
			{...props}
		/>
	);
}

export const Portal = BaseTooltip.Portal;

export type PositionerProps = ComponentProps<typeof BaseTooltip.Positioner>;

export function Positioner({ className, sideOffset = 11, ...props }: PositionerProps) {
	return (
		<BaseTooltip.Positioner
			data-slot="tooltip-positioner"
			sideOffset={sideOffset}
			// Above every popup: a tooltip explains something that is already inside one.
			className={cn('z-60', positioner, className)}
			{...props}
		/>
	);
}

export const Provider = BaseTooltip.Provider;

export const Root = BaseTooltip.Root;

export type TriggerProps = ComponentProps<typeof BaseTooltip.Trigger>;

export const Trigger = ({ ...props }: TriggerProps) => (
	<BaseTooltip.Trigger delay={100} {...props} />
);

export type ViewportProps = ComponentProps<typeof BaseTooltip.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseTooltip.Viewport
			data-slot="tooltip-viewport"
			className={cn(viewport, '[--viewport-inline-padding:--spacing(2.5)] py-1', className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Tooltip = {
	Provider,
	Root,
	Trigger,
	Portal,
	Positioner,
	Popup,
	Viewport,
	Arrow,
	/** One popup opened by several detached triggers, each with its own payload. */
	createHandle: BaseTooltip.createHandle,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Tooltip/demos/basic.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

export default function Basic() {
	return (
		<Tooltip.Provider delay={300}>
			<Tooltip.Root>
				<Tooltip.Trigger render={<Button variant="outline">hover me</Button>} />
				<Tooltip.Portal>
					<Tooltip.Positioner>
						<Tooltip.Popup>
							a hint, on hover and on focus
							<Tooltip.Arrow />
						</Tooltip.Popup>
					</Tooltip.Positioner>
				</Tooltip.Portal>
			</Tooltip.Root>
			<Tooltip.Root>
				<Tooltip.Trigger render={<Button variant="ghost">underneath</Button>} />
				<Tooltip.Portal>
					<Tooltip.Positioner side="bottom" align="start">
						<Tooltip.Popup>
							with an arrow, aligned to the start edge
							<Tooltip.Arrow />
						</Tooltip.Popup>
					</Tooltip.Positioner>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}
```

### src/pages/Tooltip/demos/detached.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';

const handle = Tooltip.createHandle<string>();

const hints = [
	{ label: 'play', hint: 'listen to audio preview' },
	{ label: 'timer', hint: 'set a timer' },
	{ label: 'delete', hint: 'delete: this cannot be undone' },
];

export default function Detached() {
	return (
		<Tooltip.Provider delay={300}>
			<div className="flex">
				{hints.map(({ label, hint }) => (
					<Tooltip.Trigger
						key={label}
						handle={handle}
						payload={hint}
						render={
							<Button variant="outline" size="sm">
								{label}
							</Button>
						}
					/>
				))}
			</div>
			<Tooltip.Root handle={handle}>
				{({ payload }) => (
					<Tooltip.Portal>
						<Tooltip.Positioner>
							<Tooltip.Popup>
								<Tooltip.Arrow />
								<Tooltip.Viewport>{payload}</Tooltip.Viewport>
							</Tooltip.Popup>
						</Tooltip.Positioner>
					</Tooltip.Portal>
				)}
			</Tooltip.Root>
		</Tooltip.Provider>
	);
}
```
