import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowVariant } from '@/lib/control';
import { cn } from '@/lib/utils';

export type MenuItemProps = ComponentProps<typeof BaseMenu.Item> & {
	variant?: RowVariant;
};

export function MenuItem({ className, variant = 'default', ...props }: MenuItemProps) {
	return (
		<BaseMenu.Item
			data-slot="menu-item"
			data-variant={variant}
			className={cn(
				row,
				'cursor-pointer pr-8',
				variant === 'destructive' && rowDestructive,
				className,
			)}
			{...props}
		/>
	);
}
