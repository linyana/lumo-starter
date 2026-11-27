import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import type { ToastPosition } from '../../types';
import { ToastItemContext, useToastPosition } from '../context';

type SwipeAxis = 'up' | 'down' | 'left' | 'right';

const swipeDirectionByPosition: Record<ToastPosition, SwipeAxis[]> = {
	'top-left': ['up', 'left'],
	'top-center': ['up'],
	'top-right': ['up', 'right'],
	'bottom-left': ['down', 'left'],
	'bottom-center': ['down'],
	'bottom-right': ['down', 'right'],
};

const stackClasses = cn(
	'group/toast pointer-events-auto absolute inset-x-0 z-[calc(1000-var(--toast-index,0))] w-full select-none',
	'[--gap:0.75rem] [--peek:0.75rem]',
	'[--scale:calc(max(0,1-(var(--toast-index,0)*0.1)))] [--shrink:calc(1-var(--scale))]',
	'[--height:var(--toast-frontmost-height,var(--toast-height))]',
	'h-(--height) data-expanded:h-(--toast-height)',
	'data-ending-style:opacity-0',
	'data-limited:pointer-events-none data-limited:opacity-0',
	'[transition:transform_var(--duration-overlay)_var(--ease-overlay),opacity_var(--duration-overlay),height_var(--duration-state)]',
);

const surfaceClasses = 'rounded-xl border bg-popover text-sm text-popover-foreground shadow-lg';

const stackTopClasses = cn(
	'top-0 origin-top',
	'[--offset-y:calc(var(--toast-offset-y,0px)+(var(--toast-index,0)*var(--gap))+var(--toast-swipe-movement-y,0px))]',
	'[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)+(var(--toast-index,0)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]',
	'data-expanded:[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(var(--offset-y))]',
	'motion-safe:data-starting-style:[transform:translateY(-150%)]',
	'motion-safe:[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]',
	'motion-safe:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]',
	'motion-safe:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))_translateY(var(--offset-y))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))_translateY(var(--offset-y))]',
	'motion-safe:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))_translateY(var(--offset-y))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))_translateY(var(--offset-y))]',
	'motion-safe:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)-150%))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)-150%))]',
	"after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
);

const stackBottomClasses = cn(
	'bottom-0 origin-bottom',
	'[--offset-y:calc(var(--toast-offset-y,0px)*-1+var(--toast-index,0)*var(--gap)*-1+var(--toast-swipe-movement-y,0px))]',
	'[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--toast-swipe-movement-y,0px)-(var(--toast-index,0)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]',
	'data-expanded:[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(var(--offset-y))]',
	'motion-safe:data-starting-style:[transform:translateY(150%)]',
	'motion-safe:[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
	'motion-safe:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)+150%))]',
	'motion-safe:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))_translateY(var(--offset-y))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)-150%))_translateY(var(--offset-y))]',
	'motion-safe:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))_translateY(var(--offset-y))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x,0px)+150%))_translateY(var(--offset-y))]',
	'motion-safe:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)-150%))]',
	'motion-safe:data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y,0px)-150%))]',
	"after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
);

export type ToastRootProps = Omit<ComponentProps<typeof BaseToast.Root>, 'className'> & {
	position?: ToastPosition;
	className?: string;
};

export function ToastRoot({
	position: positionProp,
	swipeDirection,
	className,
	toast,
	...props
}: ToastRootProps) {
	const contextPosition = useToastPosition();
	const position = positionProp ?? contextPosition;
	const isBottom = position.startsWith('bottom');

	return (
		<ToastItemContext value={toast}>
			<BaseToast.Root
				data-slot="toast"
				data-position={position}
				toast={toast}
				swipeDirection={swipeDirection ?? swipeDirectionByPosition[position]}
				className={cn(
					stackClasses,
					isBottom ? stackBottomClasses : stackTopClasses,
					surfaceClasses,
					className,
				)}
				{...props}
			/>
		</ToastItemContext>
	);
}
