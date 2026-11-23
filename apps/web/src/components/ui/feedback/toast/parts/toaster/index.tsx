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
	children?: (toast: ToastRootToastObject) => ReactNode;
};

function Interior({ toast }: { toast: ToastRootToastObject }) {
	return (
		<>
			<ToastIcon />
			<div className="flex min-w-0 flex-1 items-start gap-2">
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<ToastTitle />
					<ToastDescription className={toast.title === undefined ? 'text-sm' : undefined} />
				</div>
				<ToastAction />
				<ToastClose />
			</div>
		</>
	);
}

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
