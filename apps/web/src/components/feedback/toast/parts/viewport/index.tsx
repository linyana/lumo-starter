import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastViewportProps = Omit<ComponentProps<typeof BaseToast.Viewport>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The fixed strip the stack hangs from: a centred line under the top edge. Every toast inside is
 * positioned against it, so the box itself stays empty and only the toasts take pointer events —
 * a page never loses that strip to it.
 */
export function ToastViewport({ className, ...props }: ToastViewportProps) {
	return (
		<BaseToast.Viewport
			data-slot="toast-viewport"
			className={cn(
				// Over-constrained left/right with auto margins is what centres it at every width.
				'pointer-events-none fixed inset-x-4 top-4 mx-auto max-w-96',
				// Above everything: a toast is true whatever else is open.
				'z-70',
				className,
			)}
			{...props}
		/>
	);
}
