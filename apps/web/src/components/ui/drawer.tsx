import type { ComponentProps } from 'react';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { cn } from '@/lib/utils';
import { backdrop, description, title } from '@/lib/surface';

export type BackdropProps = ComponentProps<typeof BaseDrawer.Backdrop>;

export function Backdrop({ className, ...props }: BackdropProps) {
	return (
		<BaseDrawer.Backdrop
			data-slot="drawer-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}

export const Close = BaseDrawer.Close;

export type ContentProps = ComponentProps<typeof BaseDrawer.Content>;

export function Content({ className, ...props }: ContentProps) {
	return (
		<BaseDrawer.Content
			data-slot="drawer-content"
			className={cn('flex min-h-0 flex-col gap-2 overflow-y-auto p-6', className)}
			{...props}
		/>
	);
}

export type DescriptionProps = ComponentProps<typeof BaseDrawer.Description>;

export function Description({ className, ...props }: DescriptionProps) {
	return (
		<BaseDrawer.Description
			data-slot="drawer-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}

export type IndentProps = ComponentProps<typeof BaseDrawer.Indent>;

/** Wraps the app's own UI and draws back while a drawer inside the provider is open. */
export function Indent({ className, ...props }: IndentProps) {
	return (
		<BaseDrawer.Indent
			data-slot="drawer-indent"
			className={cn(
				'relative bg-background will-change-transform origin-[center_top]',
				'transition-[scale,border-radius] duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-active:scale-[0.98] data-active:rounded-t-xl',
				className,
			)}
			{...props}
		/>
	);
}

export type IndentBackgroundProps = ComponentProps<typeof BaseDrawer.IndentBackground>;

/** The surface a scaled-down app reveals at its edges. */
export function IndentBackground({ className, ...props }: IndentBackgroundProps) {
	return (
		<BaseDrawer.IndentBackground
			data-slot="drawer-indent-background"
			className={cn('absolute inset-0 bg-foreground', className)}
			{...props}
		/>
	);
}

export type PopupProps = ComponentProps<typeof BaseDrawer.Popup>;

/** The edge the panel is anchored to is Base UI's `swipeDirection`: `down` is a bottom sheet. */
export function Popup({ className, ...props }: PopupProps) {
	return (
		<BaseDrawer.Popup
			data-slot="drawer-popup"
			className={cn(
				'absolute flex flex-col overflow-hidden bg-popover text-popover-foreground shadow-overlay',
				'transition-[translate,transform] duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-swiping:transition-none',
				'data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0',
				'data-[swipe-direction=down]:max-h-[85dvh] data-[swipe-direction=down]:rounded-t-xl',
				'data-[swipe-direction=down]:border-t',
				'data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0',
				'data-[swipe-direction=up]:max-h-[85dvh] data-[swipe-direction=up]:rounded-b-xl',
				'data-[swipe-direction=up]:border-b',
				'data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0',
				'data-[swipe-direction=left]:w-80 data-[swipe-direction=left]:max-w-[85vw]',
				'data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r',
				'data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0',
				'data-[swipe-direction=right]:w-80 data-[swipe-direction=right]:max-w-[85vw]',
				'data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l',
				'data-[swipe-direction=down]:data-starting-style:translate-y-full',
				'data-[swipe-direction=down]:data-ending-style:translate-y-full',
				'data-[swipe-direction=up]:data-starting-style:-translate-y-full',
				'data-[swipe-direction=up]:data-ending-style:-translate-y-full',
				'data-[swipe-direction=left]:data-starting-style:-translate-x-full',
				'data-[swipe-direction=left]:data-ending-style:-translate-x-full',
				'data-[swipe-direction=right]:data-starting-style:translate-x-full',
				'data-[swipe-direction=right]:data-ending-style:translate-x-full',
				// A drag is applied through these variables, so the panel follows the pointer without
				// React re-rendering, and a snap point is the same expression with an offset.
				'data-[swipe-direction=down]:[transform:translateY(calc(var(--drawer-swipe-movement-y,0px)+var(--drawer-snap-point-offset,0px)))]',
				'data-[swipe-direction=up]:[transform:translateY(calc(var(--drawer-swipe-movement-y,0px)+var(--drawer-snap-point-offset,0px)))]',
				'data-[swipe-direction=left]:[transform:translateX(var(--drawer-swipe-movement-x,0px))]',
				'data-[swipe-direction=right]:[transform:translateX(var(--drawer-swipe-movement-x,0px))]',
				className,
			)}
			{...props}
		/>
	);
}

export const Portal = BaseDrawer.Portal;

export const Provider = BaseDrawer.Provider;

export const Root = BaseDrawer.Root;

export type SwipeAreaProps = ComponentProps<typeof BaseDrawer.SwipeArea>;

/** The gesture points into the drawer, so the strip sits on the opposite edge. */
export function SwipeArea({ className, ...props }: SwipeAreaProps) {
	return (
		<BaseDrawer.SwipeArea
			data-slot="drawer-swipe-area"
			className={cn(
				'fixed z-10',
				'data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:right-0',
				'data-[swipe-direction=left]:w-10',
				'data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:left-0',
				'data-[swipe-direction=right]:w-10',
				'data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:bottom-0',
				'data-[swipe-direction=up]:h-10',
				'data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:top-0',
				'data-[swipe-direction=down]:h-10',
				className,
			)}
			{...props}
		/>
	);
}

export type TitleProps = ComponentProps<typeof BaseDrawer.Title>;

export function Title({ className, ...props }: TitleProps) {
	return (
		<BaseDrawer.Title data-slot="drawer-title" className={cn(title, className)} {...props} />
	);
}

export const Trigger = BaseDrawer.Trigger;

export type ViewportProps = ComponentProps<typeof BaseDrawer.Viewport>;

export function Viewport({ className, ...props }: ViewportProps) {
	return (
		<BaseDrawer.Viewport
			data-slot="drawer-viewport"
			className={cn('fixed inset-0 z-50', className)}
			{...props}
		/>
	);
}

export const VirtualKeyboardProvider = BaseDrawer.VirtualKeyboardProvider;

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Drawer = {
	Provider,
	IndentBackground,
	Indent,
	Root,
	Trigger,
	SwipeArea,
	Portal,
	Close,
	Backdrop,
	Viewport,
	Popup,
	Content,
	Title,
	Description,
	VirtualKeyboardProvider,
	/** One popup opened by several detached triggers, each with its own payload. */
	createHandle: BaseDrawer.createHandle,
};
