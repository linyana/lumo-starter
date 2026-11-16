import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ToastItemContext } from '../context';

export type ToastRootProps = Omit<ComponentProps<typeof BaseToast.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One toast in the stack. The toast object also becomes readable by our own parts. */
export function ToastRoot({ className, toast, ...props }: ToastRootProps) {
	return (
		<ToastItemContext value={toast}>
			<BaseToast.Root
				data-slot="toast"
				toast={toast}
				className={cn(
					'absolute inset-x-0 top-0',
					// Newest first in the DOM, so the painting order has to be asked for explicitly.
					'[z-index:calc(100-var(--toast-index,0))]',
					'pointer-events-auto origin-top',
					'rounded-lg border bg-popover text-popover-foreground shadow-lifted',
					// The stack is entirely these variables: Base UI reports each toast's index, its
					// measured height and — expanded — the summed height above it, so the newest sits
					// against the top edge and the rest peek out below it, scaled back a little.
					'[--peek:0.75rem] [--gap:0.5rem]',
					'[--stack-y:calc(var(--toast-index,0)*var(--peek))]',
					'[--stack-scale:calc(1-var(--toast-index,0)*0.06)]',
					'[transform:translateX(var(--toast-swipe-movement-x,0px))_translateY(calc(var(--stack-y)_+_var(--toast-swipe-movement-y,0px)_+_var(--exit-y,0px)))_scale(var(--stack-scale))]',
					// Collapsed, every toast is clipped to the frontmost one's height; expanded, each
					// takes its own — which is also the unfurl that plays when the pointer arrives.
					'h-(--toast-frontmost-height)',
					// Height is the one layout property in the stack, and the only one that has to be:
					// it is what makes a folded card show exactly the frontmost one's worth of itself.
					// It gets the state token rather than the overlay one, so the page is laid out
					// again for a fraction of the time the composited properties are moving.
					'[transition:transform_var(--duration-overlay)_var(--ease-overlay),opacity_var(--duration-overlay)_var(--ease-overlay),height_var(--duration-state)_var(--ease-overlay)]',
					'data-expanded:[--stack-y:calc(var(--toast-offset-y,0px)_+_var(--toast-index,0)*var(--gap))]',
					'data-expanded:[--stack-scale:1]',
					'data-expanded:h-(--toast-height)',
					// It arrives from above its slot and, dismissed without a swipe, drifts back up as it
					// goes. A swiped toast is already where the finger left it, so `--exit-y` stays out of
					// the way — the swipe offset in the transform above is what carries it off.
					'data-starting-style:[--stack-y:-1rem] data-starting-style:opacity-0',
					'data-ending-style:not-data-[swipe-direction]:[--exit-y:-0.5rem]',
					'data-ending-style:opacity-0',
					// Past the provider's limit a toast stays mounted but inert, so it is drawn nowhere.
					'data-limited:hidden',
					'data-instant:transition-none',
					className,
				)}
				{...props}
			/>
		</ToastItemContext>
	);
}
