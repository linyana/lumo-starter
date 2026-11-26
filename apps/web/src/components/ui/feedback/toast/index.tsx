import {
	createToastManager as baseCreateToastManager,
	ToastProviderRoot,
	ToastToaster,
	useToastManager,
} from './parts';
import type { ToastProviderProps } from './types';

export type { ToastPosition, ToastProviderProps } from '@/components/ui/feedback/toast/types';

export const ToastProvider = ({ children, toaster, ...props }: ToastProviderProps) => (
	<ToastProviderRoot {...props}>
		{children}
		<ToastToaster {...toaster} />
	</ToastProviderRoot>
);

export const useToast = useToastManager;

export const createToastManager = baseCreateToastManager;
