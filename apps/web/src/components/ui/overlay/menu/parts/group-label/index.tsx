import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { rowGroupLabel } from '@/lib/control';
import { cn } from '@/lib/utils';

export type MenuGroupLabelProps = ComponentProps<typeof BaseMenu.GroupLabel>;

export function MenuGroupLabel({ className, ...props }: MenuGroupLabelProps) {
	return (
		<BaseMenu.GroupLabel
			data-slot="menu-group-label"
			className={cn(rowGroupLabel, className)}
			{...props}
		/>
	);
}
