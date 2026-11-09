import type { ComponentProps, ReactNode } from 'react';
import type { LumoToast } from '@/components/ui/toast';

type ToastProviderRootProps = Pick<ComponentProps<typeof LumoToast.Provider>, 'timeout' | 'limit'>;

export type ToastProviderProps = ToastProviderRootProps & {
	children: ReactNode;
};
