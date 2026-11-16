import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastDescriptionProps = Omit<
	ComponentProps<typeof BaseToast.Description>,
	'className'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** Defaults to the toast's own `description`, and renders nothing when there is none. */
export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
	return (
		<BaseToast.Description
			data-slot="toast-description"
			className={cn('text-xs text-muted-foreground', className)}
			{...props}
		/>
	);
}
