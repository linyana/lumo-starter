import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps } from 'react';
import { viewport } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type MenuViewportProps = ComponentProps<typeof BaseMenu.Viewport>;

export function MenuViewport({ className, ...props }: MenuViewportProps) {
	return (
		<BaseMenu.Viewport
			data-slot="menu-viewport"
			// The popup's own padding is vertical only, so the track takes its full width.
			className={cn(viewport, '[--viewport-inline-padding:--spacing(0)] py-0', className)}
			{...props}
		/>
	);
}
