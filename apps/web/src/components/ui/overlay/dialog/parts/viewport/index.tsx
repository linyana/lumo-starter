import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ComponentProps } from 'react';
import { modalViewport } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DialogViewportProps = ComponentProps<typeof BaseDialog.Viewport>;

export function DialogViewport({ className, ...props }: DialogViewportProps) {
	return (
		<BaseDialog.Viewport
			data-slot="dialog-viewport"
			className={cn(modalViewport, className)}
			{...props}
		/>
	);
}
