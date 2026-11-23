import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { rowSeparator } from '@/lib/control';
import { cn } from '@/lib/utils';

export type MenuSeparatorProps = ComponentProps<typeof BaseMenu.Separator>;

export function MenuSeparator({ className, ...props }: MenuSeparatorProps) {
	return (
		<BaseMenu.Separator
			data-slot="menu-separator"
			className={cn(rowSeparator, className)}
			{...props}
		/>
	);
}
