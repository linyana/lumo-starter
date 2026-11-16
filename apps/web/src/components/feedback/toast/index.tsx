import {
	createToastManager as baseCreateToastManager,
	ToastProviderRoot,
	ToastToaster,
	useToastManager,
} from './parts';
import type { ToastProviderProps } from './types';

export type { ToastProviderProps } from '@/components/feedback/toast/types';

/**
 * The queue and the stack over the page, in one mount. Everything under it can add a toast through
 * `useToast`, and the stack draws them without a caller writing the mapping twice.
 */
export const ToastProvider = ({ children, ...props }: ToastProviderProps) => (
	<ToastProviderRoot {...props}>
		{children}
		<ToastToaster />
	</ToastProviderRoot>
);

/** The queue. Add a toast with `add({ title, description, type })`. */
export const useToast = useToastManager;

/** A queue that callers outside React can share with the provider. */
export const createToastManager = baseCreateToastManager;
