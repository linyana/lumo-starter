import type { ComponentProps } from 'react';
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import { cn } from '@/lib/utils';

export type AlertDialogTriggerProps = ComponentProps<typeof BaseAlertDialog.Trigger>;

export function AlertDialogTrigger({ className, ...props }: AlertDialogTriggerProps) {
	return (
		<BaseAlertDialog.Trigger data-slot="alert-dialog-trigger" className={cn(className)} {...props} />
	);
}
