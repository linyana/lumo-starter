import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type DrawerIndentBackgroundProps = ComponentProps<typeof BaseDrawer.IndentBackground>;

/** The surface a scaled-down app reveals at its edges. */
export function DrawerIndentBackground({ className, ...props }: DrawerIndentBackgroundProps) {
	return (
		<BaseDrawer.IndentBackground
			data-slot="drawer-indent-background"
			className={cn('absolute inset-0 bg-foreground', className)}
			{...props}
		/>
	);
}
