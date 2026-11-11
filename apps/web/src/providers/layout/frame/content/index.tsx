import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type IPropsType = ComponentProps<'div'>;

/** The padded body under a page's header. Pass `p-0` where the page draws its own. */
export function Content({ className, ...props }: IPropsType) {
	return (
		<div
			data-slot="layout-content"
			className={cn('flex-1 bg-layout-content p-6', className)}
			{...props}
		/>
	);
}
