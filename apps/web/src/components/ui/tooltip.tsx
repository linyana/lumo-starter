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
