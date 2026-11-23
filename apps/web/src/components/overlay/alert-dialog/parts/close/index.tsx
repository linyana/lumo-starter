import type { ComponentProps } from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { cn } from '@/lib/utils';

export type AlertDialogCloseProps = ComponentProps<typeof BaseAlertDialog.Close>;

export function AlertDialogClose({ className, ...props }: AlertDialogCloseProps) {
	return <BaseAlertDialog.Close data-slot="alert-dialog-close" className={cn(className)} {...props} />;
}
