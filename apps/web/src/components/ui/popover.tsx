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
