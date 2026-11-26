import { Toast as BaseToast, type ToastRootToastObject } from '@base-ui/react/toast';
import type { ReactNode } from 'react';
import type { ToastPosition } from '../../types';
import { ToastAction } from '../action';
import { ToastActions } from '../actions';
import { ToastClose } from '../close';
import { ToastContent } from '../content';
import { ToastPositionContext } from '../context';
import { ToastDescription } from '../description';
import { ToastIcon } from '../icon';
import { ToastPortal } from '../portal';
import { ToastProgress } from '../progress';
import { ToastRoot } from '../root';
import { ToastTitle } from '../title';
import { ToastViewport, type ToastViewportProps } from '../viewport';

export type ToastToasterProps = Omit<ToastViewportProps, 'children'> & {
	position?: ToastPosition;
	progress?: boolean;
	timeout?: number;
	children?: (toast: ToastRootToastObject) => ReactNode;
};

function Interior({ toast }: { toast: ToastRootToastObject }) {
	return (
		<>
			<ToastIcon />
			<ToastTitle />
			<ToastDescription />
			{toast.actionProps === undefined ? null : (
				<ToastActions>
					<ToastAction />
				</ToastActions>
			)}
			<ToastClose />
		</>
	);
}

export function ToastToaster({
	className,
	children,
	position = 'bottom-right',
	progress = false,
	timeout = 5000,
	...props
}: ToastToasterProps) {
	const { toasts } = BaseToast.useToastManager();

	return (
		<ToastPositionContext value={position}>
			<ToastPortal>
				<ToastViewport className={className} {...props}>
					{toasts.map((toast) => {
						const timeoutOfToast = toast.timeout ?? timeout;
						return (
							<ToastRoot key={toast.id} toast={toast}>
								<ToastContent>
									{children === undefined ? <Interior toast={toast} /> : children(toast)}
								</ToastContent>
								{progress && timeoutOfToast > 0 ? (
									<ToastProgress key={toast.updateKey} timeout={timeoutOfToast} />
								) : null}
							</ToastRoot>
						);
					})}
				</ToastViewport>
			</ToastPortal>
		</ToastPositionContext>
	);
}
