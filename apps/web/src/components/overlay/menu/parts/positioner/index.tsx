import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type MenuPositionerProps = ComponentProps<typeof BaseMenu.Positioner>;

export function MenuPositioner({ className, ...props }: MenuPositionerProps) {
	return (
		<BaseMenu.Positioner
			data-slot="menu-positioner"
			className={cn('z-50 outline-none', positioner, className)}
			{...props}
		/>
	);
}
