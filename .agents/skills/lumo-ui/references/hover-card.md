# hover-card

> A card that arrives when a pointer rests on the thing it is about — a name, a link — and stays open while the pointer moves into it, because what it holds is something to read and click. Where a tooltip names a control in a word, this shows the whole entity.

## install

```bash
bunx shadcn@latest add @lumo/hover-card
```

- payload: `/r/hover-card.json`
- docs page: `/hover-card`
- comes with it: `@lumo/utils`, `@lumo/surface`
- npm packages: `@base-ui/react`
- lands in: `hover-card.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/hover-card.tsx

```tsx
import type { ComponentProps } from 'react';
import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import { cn } from '@/lib/utils';
import { arrow, popup, positioner, viewport } from '@/lib/surface';

export type ArrowProps = ComponentProps<typeof BasePreviewCard.Arrow>;

export function Arrow({ className, ...props }: ArrowProps) {
	return (
		<BasePreviewCard.Arrow
			data-slot="hover-card-arrow"
			className={cn(arrow, 'before:border before:border-border before:bg-popover', className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BasePreviewCard.Popup>;

/**
 * A preview is read rather than used, so the panel is a card: one column of an entity's own
 * details, capped where a line of prose stops being a line. Its width is content-sized — a shorter
 * preview is a narrower card — because the popup's own width is the one a Viewport animates.
 */
export function Popup({ className, ...props }: PopupProps) {
	return (
		<BasePreviewCard.Popup
			data-slot="hover-card-popup"
			className={cn(
				'relative rounded-xl border bg-popover p-4 text-popover-foreground shadow-lifted',
				// A Viewport inside brings its own padding, so this one would double up.
				'has-[>[data-slot=hover-card-viewport]]:p-0',
				'max-w-xs',
				popup,
				className,
			)}
			{...props}
		/>
	);
}

export const Portal = BasePreviewCard.Portal;

export type PositionerProps = ComponentProps<typeof BasePreviewCard.Positioner>;

export function Positioner({ className, sideOffset = 8, ...props }: PositionerProps) {
	return (
		<BasePreviewCard.Positioner
			data-slot="hover-card-positioner"
			sideOffset={sideOffset}
			className={cn('z-50', positioner, className)}
			{...props}
		/>
	);
}

export const Root = BasePreviewCard.Root;

export const Trigger = BasePreviewCard.Trigger;

export type ViewportProps = ComponentProps<typeof BasePreviewCard.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BasePreviewCard.Viewport
			data-slot="hover-card-viewport"
			className={cn(viewport, '[--viewport-inline-padding:--spacing(4)] py-4', className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const HoverCard = {
	Root,
	Trigger,
	Portal,
	Positioner,
	Popup,
	Viewport,
	Arrow,
	/** One popup opened by several detached triggers, each with its own payload. */
	createHandle: BasePreviewCard.createHandle,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/HoverCard/demos/basic.tsx

```tsx
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard } from '@/components/ui/hover-card';

export default function Basic() {
	return (
		<div className="flex flex-wrap items-center gap-3 text-sm">
			<Avatar.Root>
				<Avatar.Fallback>L</Avatar.Fallback>
			</Avatar.Root>
			<HoverCard.Root>
				<HoverCard.Trigger
					render={
						<button
							type="button"
							className="font-medium underline decoration-muted-foreground/40 underline-offset-4 hover:decoration-foreground"
						/>
					}
				>
					Linyana
				</HoverCard.Trigger>
				<HoverCard.Portal>
					<HoverCard.Positioner side="bottom" align="start">
						<HoverCard.Popup>
							<HoverCard.Arrow />
							<div className="flex items-center gap-3">
								<Avatar.Root size="lg">
									<Avatar.Fallback>L</Avatar.Fallback>
								</Avatar.Root>
								<div className="min-w-0">
									<p className="text-sm font-medium">Linyana</p>
									<p className="text-xs text-muted-foreground">@linyana</p>
								</div>
							</div>
							<p className="mt-3 text-sm text-muted-foreground">
								maintains lumo-ui. builds small tools that stay small, and writes
								the manual before the component.
							</p>
							<Button size="sm" className="mt-3 w-full">
								follow
							</Button>
						</HoverCard.Popup>
					</HoverCard.Positioner>
				</HoverCard.Portal>
			</HoverCard.Root>
			<span className="text-muted-foreground">rested on the name a moment ago</span>
		</div>
	);
}
```

### src/pages/HoverCard/demos/link.tsx

```tsx
import { HoverCard } from '@/components/ui/hover-card';

export default function Link() {
	return (
		<p className="max-w-md text-sm leading-relaxed text-muted-foreground">
			the manifest is not written by hand — it is read off{' '}
			<HoverCard.Root>
				{/* The trigger is an anchor, which is what Base UI renders without a `render` prop. */}
				<HoverCard.Trigger
					href="#registry.json"
					className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
				>
					registry.json
				</HoverCard.Trigger>
				<HoverCard.Portal>
					<HoverCard.Positioner side="top" align="start">
						<HoverCard.Popup>
							<p className="text-sm font-medium">registry.json</p>
							<p className="mt-1.5 text-sm text-muted-foreground">
								one item per component, one file per item, and no target: where a
								file lands is the cli&rsquo;s decision, from its type and the
								consumer&rsquo;s own aliases.
							</p>
						</HoverCard.Popup>
					</HoverCard.Positioner>
				</HoverCard.Portal>
			</HoverCard.Root>{' '}
			and the code it points at.
		</p>
	);
}
```
