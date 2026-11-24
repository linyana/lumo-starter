import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { scrollArea } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type DrawerContentProps = ComponentProps<typeof BaseDrawer.Content>;

export function DrawerContent({ className, ...props }: DrawerContentProps) {
	return (
		<BaseDrawer.Content
			data-slot="drawer-content"
			className={cn('flex min-h-0 flex-col gap-2 p-6', scrollArea, className)}
			{...props}
		/>
	);
}
