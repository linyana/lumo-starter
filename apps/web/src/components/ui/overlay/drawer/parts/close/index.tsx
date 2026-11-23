import type { ComponentProps } from 'react';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { cn } from '@/lib/utils';

export type DrawerCloseProps = ComponentProps<typeof BaseDrawer.Close>;

export function DrawerClose({ className, ...props }: DrawerCloseProps) {
	return <BaseDrawer.Close data-slot="drawer-close" className={cn(className)} {...props} />;
}
