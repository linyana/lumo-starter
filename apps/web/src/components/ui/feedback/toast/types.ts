import type { ComponentProps, ReactNode } from 'react';
import type { ToastProviderRoot } from './parts';

type ToastProviderRootProps = Pick<
	ComponentProps<typeof ToastProviderRoot>,
	'timeout' | 'limit' | 'toastManager'
>;

export type ToastProviderProps = ToastProviderRootProps & {
	children: ReactNode;
};
