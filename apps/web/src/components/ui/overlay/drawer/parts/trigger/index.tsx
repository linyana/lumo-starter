import type { ComponentProps } from 'react';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { cn } from '@/lib/utils';

export type DrawerTriggerProps = ComponentProps<typeof BaseDrawer.Trigger>;

export function DrawerTrigger({ className, ...props }: DrawerTriggerProps) {
	return <BaseDrawer.Trigger data-slot="drawer-trigger" className={cn(className)} {...props} />;
}
