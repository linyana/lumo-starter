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
