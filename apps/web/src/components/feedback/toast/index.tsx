import {
	createToastManager as baseCreateToastManager,
	ToastProviderRoot,
	ToastToaster,
	useToastManager,
} from './parts';
import type { ToastProviderProps } from './types';

export type { ToastProviderProps } from '@/components/feedback/toast/types';

export const ToastProvider = ({ children, ...props }: ToastProviderProps) => (
	<ToastProviderRoot {...props}>
		{children}
		<ToastToaster />
	</ToastProviderRoot>
);

export const useToast = useToastManager;

export const createToastManager = baseCreateToastManager;
