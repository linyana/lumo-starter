import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import type { ComponentProps } from 'react';
import { description } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type AlertDialogDescriptionProps = ComponentProps<typeof BaseAlertDialog.Description>;

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
	return (
		<BaseAlertDialog.Description
			data-slot="alert-dialog-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}
