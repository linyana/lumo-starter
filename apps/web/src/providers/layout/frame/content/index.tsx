import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type IPropsType = ComponentProps<'div'>;

export function Content({ className, ...props }: IPropsType) {
	return (
		<div
			data-slot="layout-content"
			className={cn('flex-1 bg-layout-content p-6', className)}
			{...props}
		/>
	);
}
