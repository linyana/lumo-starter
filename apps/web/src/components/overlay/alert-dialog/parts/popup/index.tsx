import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog';
import type { ComponentProps } from 'react';
import { panel } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type AlertDialogPopupProps = ComponentProps<typeof BaseAlertDialog.Popup>;

export function AlertDialogPopup({ className, ...props }: AlertDialogPopupProps) {
	return (
		<BaseAlertDialog.Popup
			data-slot="alert-dialog-popup"
			className={cn(panel, className)}
			{...props}
		/>
	);
}
