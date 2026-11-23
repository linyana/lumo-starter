import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { backdrop } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DrawerBackdropProps = ComponentProps<typeof BaseDrawer.Backdrop>;

export function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
	return (
		<BaseDrawer.Backdrop
			data-slot="drawer-backdrop"
			className={cn(backdrop, className)}
			{...props}
		/>
	);
}
