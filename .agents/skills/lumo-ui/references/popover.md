# popover

> Anchored panel that holds rich content. One popup can be shared by several detached triggers, each with its own payload. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/popover
```

- payload: `/r/popover.json`
- docs page: `/popover`
- comes with it: `@lumo/utils`, `@lumo/surface`
- npm packages: `@base-ui/react`
- lands in: `popover.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/popover.tsx

```tsx
import type { ComponentProps } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';
import { arrow, backdrop, description, popup, positioner, title, viewport } from '@/lib/surface';

export type ArrowProps = ComponentProps<typeof BasePopover.Arrow>;

export function Arrow({ className, ...props }: ArrowProps) {
	return (
		<BasePopover.Arrow
			data-slot="popover-arrow"
			// The point carries the popup's own border and fill, so the outline reads as one shape.
			className={cn(arrow, 'before:border before:border-border before:bg-popover', className)}
			{...props}
		/>
	);
}

export type BackdropProps = ComponentProps<typeof BasePopover.Backdrop>;

export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BasePopover.Backdrop
			data-slot="popover-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export const Close = BasePopover.Close;

export type DescriptionProps = ComponentProps<typeof BasePopover.Description>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BasePopover.Description
			data-slot="popover-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BasePopover.Popup>;

export function Popup({ className, ...props }: PopupProps) {
	return (
		<BasePopover.Popup
			data-slot="popover-popup"
			className={cn(
				'relative rounded-lg border bg-popover text-popover-foreground p-3 shadow-lifted',
				// A Viewport inside brings its own padding, so this one would double up.
				'has-[>[data-slot=popover-viewport]]:p-0',
				'max-w-md',
				popup,
				className,
			)}
			{...props}
		/>
	);
}

export const Portal = BasePopover.Portal;

export type PositionerProps = ComponentProps<typeof BasePopover.Positioner>;

export function Positioner({ className, sideOffset = 8, ...props }: PositionerProps) {
	return (
		<BasePopover.Positioner
			data-slot="popover-positioner"
			sideOffset={sideOffset}
			className={cn('z-50', positioner, className)}
			{...props}
		/>
	);
}

export const Root = BasePopover.Root;

export type TitleProps = ComponentProps<typeof BasePopover.Title>;

export function Title({ className, ...props }: TitleProps) {
	return (
		<BasePopover.Title data-slot="popover-title" className={cn(title, className)} {...props} />
	);
}

export const Trigger = BasePopover.Trigger;

export type ViewportProps = ComponentProps<typeof BasePopover.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BasePopover.Viewport
			data-slot="popover-viewport"
			className={cn(viewport, '[--viewport-inline-padding:--spacing(3)] py-3', className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Popover = {
	Root,
	Trigger,
	Close,
	Portal,
	Backdrop,
	Positioner,
	Popup,
	Viewport,
	Arrow,
	Title,
	Description,
	/** One popup opened by several detached triggers, each with its own payload. */
	createHandle: BasePopover.createHandle,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Popover/demos/basic.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';

export default function Basic() {
	return (
		<Popover.Root>
			<Popover.Trigger render={<Button variant="outline">open popover</Button>} />
			<Popover.Portal>
				<Popover.Positioner side="bottom" align="start">
					<Popover.Popup>
						<Popover.Arrow />
						<Popover.Title>deploy to production?</Popover.Title>
						<Popover.Description>
							the site rebuilds in about a minute. the previous build stays live until
							the new one answers.
						</Popover.Description>
						<div className="mt-3 flex justify-end gap-2">
							<Popover.Close
								render={
									<Button variant="ghost" size="sm">
										cancel
									</Button>
								}
							/>
							<Popover.Close render={<Button size="sm">deploy</Button>} />
						</div>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
```

### src/pages/Popover/demos/detached.tsx

```tsx
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';

const handle = Popover.createHandle<ReactNode>();

const panels: { label: string; content: ReactNode }[] = [
	{
		label: 'notifications',
		content: (
			<>
				<Popover.Title>notifications</Popover.Title>
				<Popover.Description>you are all caught up. good job!</Popover.Description>
			</>
		),
	},
	{
		label: 'activity',
		content: (
			<>
				<Popover.Title>activity</Popover.Title>
				<Popover.Description>nothing interesting happened recently.</Popover.Description>
			</>
		),
	},
	{
		label: 'account',
		content: (
			<>
				<Popover.Title>rika li</Popover.Title>
				<Popover.Description>pro plan</Popover.Description>
				<div className="flex flex-col gap-2 pt-2">
					<a href="#" className="w-fit underline underline-offset-2 hover:no-underline">
						account settings
					</a>
					<a href="#" className="w-fit underline underline-offset-2 hover:no-underline">
						log out
					</a>
				</div>
			</>
		),
	},
];

export default function Detached() {
	return (
		<>
			<div className="flex flex-wrap justify-center gap-2">
				{panels.map(({ label, content }) => (
					<Popover.Trigger
						key={label}
						handle={handle}
						payload={content}
						render={
							<Button variant="outline" size="sm">
								{label}
							</Button>
						}
					/>
				))}
			</div>
			<Popover.Root handle={handle}>
				{({ payload }) => (
					<Popover.Portal>
						<Popover.Positioner sideOffset={8}>
							<Popover.Popup>
								<Popover.Arrow />
								<Popover.Viewport>{payload}</Popover.Viewport>
							</Popover.Popup>
						</Popover.Positioner>
					</Popover.Portal>
				)}
			</Popover.Root>
		</>
	);
}
```
