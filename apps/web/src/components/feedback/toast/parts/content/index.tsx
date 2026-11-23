import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastContentProps = Omit<ComponentProps<typeof BaseToast.Content>, 'className'> & {
	className?: string;
};

export function ToastContent({ className, ...props }: ToastContentProps) {
	return (
		<BaseToast.Content
			data-slot="toast-content"
			className={cn(
				'flex items-start gap-3 p-3',
				'transition-opacity duration-(--duration-state)',
				'data-behind:opacity-0 data-expanded:opacity-100',
				className,
			)}
			{...props}
		/>
	);
}
