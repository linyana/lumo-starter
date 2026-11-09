import { LumoToast } from '@/components/ui/toast';
import type { ToastProviderProps } from './types';

/**
 * The queue and the stack over the page, in one mount. Everything under it can add a toast through
 * `useToast`, and the stack draws them without a caller writing the mapping twice.
 */
export const ToastProvider = ({ children, timeout, limit }: ToastProviderProps) => (
	<LumoToast.Provider timeout={timeout} limit={limit}>
		{children}
		<LumoToast.Toaster />
	</LumoToast.Provider>
);

/** The queue. Add a toast with `add({ title, description, type })`. */
export const useToast = LumoToast.useToastManager;
