import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { popup } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type MenuPopupProps = ComponentProps<typeof BaseMenu.Popup>;

export function MenuPopup({ className, ...props }: MenuPopupProps) {
	return (
		<BaseMenu.Popup
			data-slot="menu-popup"
			className={cn(
				'relative rounded-lg border bg-popover py-1 text-popover-foreground',
				'shadow-lg outline-none',
				popup,
				className,
			)}
			{...props}
		/>
	);
}
