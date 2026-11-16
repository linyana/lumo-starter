import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import type { ComponentProps } from 'react';
import { backdrop } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type AlertDialogBackdropProps = ComponentProps<typeof BaseAlertDialog.Backdrop>;

export function AlertDialogBackdrop({ className, ...props }: AlertDialogBackdropProps) {
	return (
		<BaseAlertDialog.Backdrop
			data-slot="alert-dialog-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}
