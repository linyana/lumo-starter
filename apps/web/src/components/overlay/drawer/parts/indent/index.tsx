import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type DrawerIndentProps = ComponentProps<typeof BaseDrawer.Indent>;

export function DrawerIndent({ className, ...props }: DrawerIndentProps) {
	return (
		<BaseDrawer.Indent
			data-slot="drawer-indent"
			className={cn(
				'relative bg-background will-change-transform origin-[center_top]',
				'transition-[scale,border-radius] duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-active:scale-[0.98] data-active:rounded-t-xl',
				className,
			)}
			{...props}
		/>
	);
}
