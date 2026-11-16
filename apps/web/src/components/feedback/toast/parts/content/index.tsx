import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastContentProps = Omit<ComponentProps<typeof BaseToast.Content>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The one row a toast draws: a glyph, the text, then whatever acts. Behind the frontmost toast
 * it fades out, because the root above it is clipped and the text would otherwise show through.
 */
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
