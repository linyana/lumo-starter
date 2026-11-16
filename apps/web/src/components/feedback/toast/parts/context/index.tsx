import type { ToastRootToastObject } from '@base-ui/react/toast';
import { createContext, useContext } from 'react';

export const ToastItemContext = createContext<ToastRootToastObject | null>(null);

/**
 * The toast a part is drawn inside. Base UI hands the object to `ToastRoot` only and drops it down
 * to its own parts as `data-type`; a part of ours that needs the whole thing reads it here.
 */
export function useToastItem() {
	return useContext(ToastItemContext);
}
