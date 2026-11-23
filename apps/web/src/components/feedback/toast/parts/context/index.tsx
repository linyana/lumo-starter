import type { ToastRootToastObject } from '@base-ui/react/toast';
import { createContext, useContext } from 'react';

export const ToastItemContext = createContext<ToastRootToastObject | null>(null);

export function useToastItem() {
	return useContext(ToastItemContext);
}
