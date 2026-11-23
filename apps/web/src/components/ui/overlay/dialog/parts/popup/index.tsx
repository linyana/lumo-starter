import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';
import { panel } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DialogPopupProps = ComponentProps<typeof BaseDialog.Popup>;

export function DialogPopup({ className, ...props }: DialogPopupProps) {
	return <BaseDialog.Popup data-slot="dialog-popup" className={cn(panel, className)} {...props} />;
}
