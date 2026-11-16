import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { description } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DrawerDescriptionProps = ComponentProps<typeof BaseDrawer.Description>;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
	return (
		<BaseDrawer.Description
			data-slot="drawer-description"
			className={cn(description, className)}
			{...props}
		/>
	);
}
