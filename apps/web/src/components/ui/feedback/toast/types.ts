import type { ComponentProps, ReactNode } from 'react';
import type { ToastProviderRoot, ToastToasterProps } from './parts';

export type ToastPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right';

type ToastProviderRootProps = Pick<
	ComponentProps<typeof ToastProviderRoot>,
	'timeout' | 'limit' | 'toastManager'
>;

export type ToastProviderProps = ToastProviderRootProps & {
	children: ReactNode;
	toaster?: Omit<ToastToasterProps, 'children'>;
};
