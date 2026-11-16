import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';
import { description } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DialogDescriptionProps = ComponentProps<typeof BaseDialog.Description>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
	return (
		<BaseDialog.Description
			data-slot="dialog-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}
