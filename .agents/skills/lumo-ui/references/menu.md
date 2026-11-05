# menu

> A menu of actions on a trigger: groups, a group label, separators, and one popup several detached triggers can share. Behaviour from Base UI, appearance from tokens.

## install

```bash
bunx shadcn@latest add @lumo/menu
```

- payload: `/r/menu.json`
- docs page: `/menu`
- comes with it: `@lumo/utils`, `@lumo/surface`, `@lumo/button`
- npm packages: `@base-ui/react`, `tailwind-variants`
- lands in: `menu.tsx` under the project's `aliases.ui`

## source

What ships is source, and the source is the API: there is no generated prop table to consult, so read the signatures below rather than guessing at one. A part this item needs from another item lives in that item’s page.

### src/components/ui/menu.tsx

```tsx
import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { row, rowGroupLabel, rowSeparator } from '@/lib/control';
import { popup, positioner, viewport } from '@/lib/surface';

export const Group = BaseMenu.Group;

export type GroupLabelProps = ComponentProps<typeof BaseMenu.GroupLabel>;

export function GroupLabel({ className, ...props }: GroupLabelProps) {
	return (
		<BaseMenu.GroupLabel
			data-slot="menu-group-label"
			className={cn(rowGroupLabel, className)}
			{...props}
		/>
	);
}

export type ItemProps = ComponentProps<typeof BaseMenu.Item>;

/**
 * A row, with the extra room on the right that a row's own action takes. The cursor stays the
 * platform's: a menu row is an action to run where it is, not a place to go.
 */
export function Item({ className, ...props }: ItemProps) {
	return (
		<BaseMenu.Item
			data-slot="menu-item"
			className={cn(row, 'cursor-default pr-8', className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseMenu.Popup>;

export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseMenu.Popup
			data-slot="menu-popup"
			className={cn(
				'relative rounded-lg border bg-popover py-1 text-popover-foreground',
				'shadow-lifted outline-none',
				popup,
				className,
			)}
			{...props}
		/>
	);
}

export const Portal = BaseMenu.Portal;

export type PositionerProps = ComponentProps<typeof BaseMenu.Positioner>;

export function Positioner({ className, ...props }: PositionerProps) {
	return (
		<BaseMenu.Positioner
			data-slot="menu-positioner"
			className={cn('z-50 outline-none', positioner, className)}
			{...props}
		/>
	);
}

export const Root = BaseMenu.Root;

export type SeparatorProps = ComponentProps<typeof BaseMenu.Separator>;

export function Separator({ className, ...props }: SeparatorProps) {
	return (
		<BaseMenu.Separator
			data-slot="menu-separator"
			className={cn(rowSeparator, className)}
			{...props}
		/>
	);
}

export type TriggerProps<Payload = unknown> = BaseMenu.Trigger.Props<Payload>;

/** The button that opens it, appearance-free: compose a `Button` through `render`. */
export const Trigger = BaseMenu.Trigger;

export type ViewportProps = ComponentProps<typeof BaseMenu.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseMenu.Viewport
			data-slot="menu-viewport"
			// The popup's own padding is vertical only, so the track takes its full width.
			className={cn(viewport, '[--viewport-inline-padding:--spacing(0)] py-0', className)}
			{...props}
		/>
	);
}

/**
 * Base UI supplies behaviour — the roving highlight, the typeahead, the focus that returns to the
 * trigger — and these parts supply appearance. Compose with `render`.
 *
 * Not to be confused with `Nav`, which is a list of destinations that is always in the layout: a
 * menu is opened, holds actions, and closes.
 */
export const Menu = {
	Root,
	Trigger,
	Portal,
	Positioner,
	Popup,
	Viewport,
	Group,
	GroupLabel,
	Item,
	Separator,
	/** One popup opened by several detached triggers, each with its own payload. */
	createHandle: BaseMenu.createHandle,
};
```

## examples

Each is a page in this repository; the `@/` it imports resolve through the consumer’s own aliases once the files are installed.

### src/pages/Menu/demos/basic.tsx

```tsx
import { Button } from '@/components/ui/button';
import { Menu } from '@/components/ui/menu';

const groups = [
	['copy link', 'copy embed code'],
	['share to contacts', 'share to social'],
];

export default function Basic() {
	return (
		<Menu.Root>
			<Menu.Trigger
				render={
					<Button variant="outline" size="sm">
						share
					</Button>
				}
			/>
			<Menu.Portal>
				<Menu.Positioner sideOffset={8} align="start">
					<Menu.Popup>
						<Menu.Group>
							<Menu.GroupLabel>share</Menu.GroupLabel>
							{groups[0]!.map((item) => (
								<Menu.Item key={item}>{item}</Menu.Item>
							))}
						</Menu.Group>
						<Menu.Separator />
						<Menu.Group>
							{groups[1]!.map((item) => (
								<Menu.Item key={item}>{item}</Menu.Item>
							))}
						</Menu.Group>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}
```

### src/pages/Menu/demos/detached.tsx

```tsx
import { Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from '@/components/ui/menu';

const menus = {
	library: {
		heading: 'library',
		groups: [['add to library', 'add to favorites'], ['create playlist']],
	},
	playback: {
		heading: 'playback',
		groups: [
			['play now', 'add to queue'],
			['play next', 'sleep timer'],
		],
	},
	share: { heading: 'share', groups: [['copy link', 'copy embed code'], ['share to social']] },
} as const;

type Key = keyof typeof menus;

const keys = Object.keys(menus) as Key[];
const handle = Menu.createHandle<Key>();

export default function Detached() {
	return (
		<>
			<div className="flex flex-wrap justify-center gap-2">
				{keys.map((key) => (
					<Menu.Trigger
						key={key}
						handle={handle}
						payload={key}
						render={<Button variant="outline" size="sm" />}
					>
						{menus[key].heading}
					</Menu.Trigger>
				))}
			</div>
			<Menu.Root handle={handle} modal={false}>
				{({ payload }) => (
					<Menu.Portal>
						<Menu.Positioner sideOffset={8} align="start">
							<Menu.Popup>
								<Menu.Viewport>
									{payload &&
										menus[payload].groups.map((group, index) => (
											<Fragment key={group[0]}>
												<Menu.Group>
													{index === 0 && (
														<Menu.GroupLabel>
															{menus[payload].heading}
														</Menu.GroupLabel>
													)}
													{group.map((item) => (
														<Menu.Item key={item}>{item}</Menu.Item>
													))}
												</Menu.Group>
												{index < menus[payload].groups.length - 1 && (
													<Menu.Separator />
												)}
											</Fragment>
										))}
								</Menu.Viewport>
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				)}
			</Menu.Root>
		</>
	);
}
```
