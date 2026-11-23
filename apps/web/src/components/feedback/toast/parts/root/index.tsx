import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ToastItemContext } from '../context';

export type ToastRootProps = Omit<ComponentProps<typeof BaseToast.Root>, 'className'> & {
	className?: string;
};

export function ToastRoot({ className, toast, ...props }: ToastRootProps) {
	return (
		<ToastItemContext value={toast}>
			<BaseToast.Root
				data-slot="toast"
				toast={toast}
				className={cn(
					'absolute inset-x-0 top-0',
					'[z-index:calc(100-var(--toast-index,0))]',
					'pointer-events-auto origin-top',
					'rounded-lg border bg-popover text-popover-foreground shadow-lifted',
					'[--peek:0.75rem] [--gap:0.5rem]',
					'[--stack-y:calc(var(--toast-index,0)*var(--peek))]',
					'[--stack-scale:calc(1-var(--toast-index,0)*0.06)]',
					'[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--stack-y)_+_var(--toast-swipe-movement-y,0px)_+_var(--exit-y,0px)))_scale(var(--stack-scale))]',
					'h-(--toast-frontmost-height)',
					'[transition:transform_var(--duration-overlay)_var(--ease-overlay),opacity_var(--duration-overlay)_var(--ease-overlay),height_var(--duration-state)_var(--ease-overlay)]',
					'data-expanded:[--stack-y:calc(var(--toast-offset-y,0px)_+_var(--toast-index,0)*var(--gap))]',
					'data-expanded:[--stack-scale:1]',
					'data-expanded:h-(--toast-height)',
					'data-starting-style:[--stack-y:-1rem] data-starting-style:opacity-0',
					'data-ending-style:not-data-[swipe-direction]:[--exit-y:-0.5rem]',
					'data-ending-style:opacity-0',
					'data-limited:hidden',
					'data-instant:transition-none',
					className,
				)}
				{...props}
			/>
		</ToastItemContext>
	);
}
