import { Toast as BaseToast, type ToastRootToastObject } from '@base-ui/react/toast';
import type { ReactNode } from 'react';
import { ToastAction } from '../action';
import { ToastClose } from '../close';
import { ToastContent } from '../content';
import { ToastDescription } from '../description';
import { ToastIcon } from '../icon';
import { ToastPortal } from '../portal';
import { ToastRoot } from '../root';
import { ToastTitle } from '../title';
import { ToastViewport, type ToastViewportProps } from '../viewport';

export type ToastToasterProps = Omit<ToastViewportProps, 'children'> & {
	/** Draws each toast yourself, given the toast being drawn. */
	children?: (toast: ToastRootToastObject) => ReactNode;
};

/** A toast unless you say otherwise: its type, its words, then whatever acts on it. */
function Interior({ toast }: { toast: ToastRootToastObject }) {
	return (
		<>
			<ToastIcon />
			<div className="flex min-w-0 flex-1 items-start gap-2">
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<ToastTitle />
					{/* With no title the description is the whole message, so it takes the body size. */}
					<ToastDescription className={toast.title === undefined ? 'text-sm' : undefined} />
				</div>
				<ToastAction />
				<ToastClose />
			</div>
		</>
	);
}

/**
 * The stack, mounted once inside a `ToastProvider`. It maps the queue to parts — the one piece of a
 * toast nobody should have to write twice — and leaves everything else to them.
 */
export function ToastToaster({ className, children, ...props }: ToastToasterProps) {
	const { toasts } = BaseToast.useToastManager();

	return (
		<ToastPortal>
			<ToastViewport className={className} {...props}>
				{toasts.map((toast) => (
					<ToastRoot key={toast.id} toast={toast}>
						<ToastContent>
							{children === undefined ? <Interior toast={toast} /> : children(toast)}
						</ToastContent>
					</ToastRoot>
				))}
			</ToastViewport>
		</ToastPortal>
	);
}
