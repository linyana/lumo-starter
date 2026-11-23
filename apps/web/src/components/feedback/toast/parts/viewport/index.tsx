import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastViewportProps = Omit<ComponentProps<typeof BaseToast.Viewport>, 'className'> & {
	className?: string;
};

export function ToastViewport({ className, ...props }: ToastViewportProps) {
	return (
		<BaseToast.Viewport
			data-slot="toast-viewport"
			className={cn(
				'pointer-events-none fixed inset-x-4 top-4 mx-auto max-w-96',
				'z-70',
				className,
			)}
			{...props}
		/>
	);
}
