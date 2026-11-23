import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';
import { backdrop } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DialogBackdropProps = ComponentProps<typeof BaseDialog.Backdrop>;

export function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
	return (
		<BaseDialog.Backdrop
			data-slot="dialog-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}
