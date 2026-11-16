import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastTitleProps = Omit<ComponentProps<typeof BaseToast.Title>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** Defaults to the toast's own `title`, and renders nothing when there is none. */
export function ToastTitle({ className, ...props }: ToastTitleProps) {
	return (
		<BaseToast.Title
			data-slot="toast-title"
			className={cn('text-sm font-medium', className)}
			{...props}
		/>
	);
}
