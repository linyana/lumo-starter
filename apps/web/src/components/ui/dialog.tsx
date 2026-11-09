import type { ComponentProps } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';
import { backdrop, description, modalViewport, panel, title } from '@/lib/surface';

export type BackdropProps = ComponentProps<typeof BaseDialog.Backdrop>;

export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BaseDialog.Backdrop
			data-slot="dialog-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export const Close = BaseDialog.Close;

export type DescriptionProps = ComponentProps<typeof BaseDialog.Description>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseDialog.Description
			data-slot="dialog-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseDialog.Popup>;

export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseDialog.Popup data-slot="dialog-popup" className={cn(panel, className)} {...props} />
	);
}

export const Portal = BaseDialog.Portal;

export const Root = BaseDialog.Root;

export type TitleProps = ComponentProps<typeof BaseDialog.Title>;

export function Title({ className, ...props }: TitleProps) {
	return (
		<BaseDialog.Title data-slot="dialog-title" className={cn(title, className)} {...props} />
	);
}

export const Trigger = BaseDialog.Trigger;

export type ViewportProps = ComponentProps<typeof BaseDialog.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseDialog.Viewport
			data-slot="dialog-viewport"
			className={cn(modalViewport, className)}
			{...props}
		/>
	);
}

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Dialog = {
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
