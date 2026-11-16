import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import type { ComponentProps } from 'react';
import { title } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type AlertDialogTitleProps = ComponentProps<typeof BaseAlertDialog.Title>;

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
	return (
		<BaseAlertDialog.Title
			data-slot="alert-dialog-title"
			className={cn(title, className)}
			{...props}
		/>
	);
}
