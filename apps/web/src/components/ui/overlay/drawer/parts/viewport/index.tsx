import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type DrawerViewportProps = ComponentProps<typeof BaseDrawer.Viewport>;

export function DrawerViewport({ className, ...props }: DrawerViewportProps) {
	return (
		<BaseDrawer.Viewport
			data-slot="drawer-viewport"
			className={cn('fixed inset-0 z-50', className)}
			{...props}
		/>
	);
}
