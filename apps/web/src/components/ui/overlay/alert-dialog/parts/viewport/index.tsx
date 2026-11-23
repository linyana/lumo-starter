import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import type { ComponentProps } from 'react';
import { modalViewport } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type AlertDialogViewportProps = ComponentProps<typeof BaseAlertDialog.Viewport>;

export function AlertDialogViewport({ className, ...props }: AlertDialogViewportProps) {
	return (
		<BaseAlertDialog.Viewport
			data-slot="alert-dialog-viewport"
			className={cn(modalViewport, className)}
			{...props}
		/>
	);
}
