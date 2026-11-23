import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type DrawerPopupProps = ComponentProps<typeof BaseDrawer.Popup>;

export function DrawerPopup({ className, ...props }: DrawerPopupProps) {
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
