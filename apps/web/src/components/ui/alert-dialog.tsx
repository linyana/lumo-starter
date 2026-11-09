import type { ComponentProps } from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { cn } from '@/lib/utils';
import { backdrop, description, modalViewport, panel, title } from '@/lib/surface';

export type BackdropProps = ComponentProps<typeof BaseAlertDialog.Backdrop>;

export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BaseAlertDialog.Backdrop
			data-slot="alert-dialog-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export const Close = BaseAlertDialog.Close;

export type DescriptionProps = ComponentProps<typeof BaseAlertDialog.Description>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseAlertDialog.Description
			data-slot="alert-dialog-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseAlertDialog.Popup>;

/** The same panel a dialog is drawn in: the role underneath is the only difference. */
export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseAlertDialog.Popup
			data-slot="alert-dialog-popup"
			className={cn(panel, className)}
			{...props}
		/>
	);
}

export const Portal = BaseAlertDialog.Portal;

export const Root = BaseAlertDialog.Root;

export type TitleProps = ComponentProps<typeof BaseAlertDialog.Title>;

export function Title({ className, ...props }: TitleProps) {
	return (
		<BaseAlertDialog.Title
			data-slot="alert-dialog-title"
			className={cn(title, className)}
			{...props}
		/>
	);
}

export const Trigger = BaseAlertDialog.Trigger;

export type ViewportProps = ComponentProps<typeof BaseAlertDialog.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseAlertDialog.Viewport
			data-slot="alert-dialog-viewport"
			className={cn(modalViewport, className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const LumoAlertDialog = {
	Root,
	Trigger,
	Portal,
	Close,
	Backdrop,
	Viewport,
	Popup,
	Title,
	Description,
};
