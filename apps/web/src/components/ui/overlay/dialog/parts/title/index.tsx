import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';
import { title } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DialogTitleProps = ComponentProps<typeof BaseDialog.Title>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
	return <BaseDialog.Title data-slot="dialog-title" className={cn(title, className)} {...props} />;
}
