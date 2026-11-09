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
export const LumoHoverCard = {
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
