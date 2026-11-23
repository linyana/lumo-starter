import type { ComponentProps } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';

export type DialogTriggerProps = ComponentProps<typeof BaseDialog.Trigger>;

export function DialogTrigger({ className, ...props }: DialogTriggerProps) {
	return <BaseDialog.Trigger data-slot="dialog-trigger" className={cn(className)} {...props} />;
}
