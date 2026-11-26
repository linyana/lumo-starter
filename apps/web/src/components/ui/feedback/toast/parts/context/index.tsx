import type { ToastRootToastObject } from '@base-ui/react/toast';
import { createContext, useContext } from 'react';
import type { ToastPosition } from '../../types';

export const ToastItemContext = createContext<ToastRootToastObject | null>(null);

export const ToastPositionContext = createContext<ToastPosition>('bottom-right');

export function useToastItem() {
	return useContext(ToastItemContext);
}

export function useToastPosition() {
	return useContext(ToastPositionContext);
}
