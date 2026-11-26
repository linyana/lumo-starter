import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ToastActionsProps = ComponentProps<'div'>;

export function ToastActions({ className, ...props }: ToastActionsProps) {
	return (
		<div
			data-slot="toast-actions"
			className={cn('flex justify-end gap-2 pt-2 [grid-area:actions]', className)}
			{...props}
		/>
	);
}
