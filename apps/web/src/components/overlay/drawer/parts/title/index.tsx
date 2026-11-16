import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { title } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DrawerTitleProps = ComponentProps<typeof BaseDrawer.Title>;

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
	return <BaseDrawer.Title data-slot="drawer-title" className={cn(title, className)} {...props} />;
}
