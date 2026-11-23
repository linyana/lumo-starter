import type { ComponentProps } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';

export type DialogCloseProps = ComponentProps<typeof BaseDialog.Close>;

export function DialogClose({ className, ...props }: DialogCloseProps) {
	return <BaseDialog.Close data-slot="dialog-close" className={cn(className)} {...props} />;
}
