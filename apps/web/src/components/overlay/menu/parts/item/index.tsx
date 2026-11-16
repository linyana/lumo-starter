import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowTone } from '@/lib/control';
import { cn } from '@/lib/utils';

export type MenuItemProps = ComponentProps<typeof BaseMenu.Item> & {
	/** What selecting the row does, drawn in the colour of a consequence. */
	tone?: RowTone;
};

/** A row, with extra room on the right for an action of its own. */
export function MenuItem({ className, tone = 'default', ...props }: MenuItemProps) {
	return (
		<BaseMenu.Item
			data-slot="menu-item"
			data-tone={tone}
			className={cn(
				row,
				'cursor-pointer pr-8',
				tone === 'destructive' && rowDestructive,
				className,
			)}
			{...props}
		/>
	);
}
