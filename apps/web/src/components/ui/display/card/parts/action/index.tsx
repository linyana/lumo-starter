import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardActionProps = ComponentProps<'div'>;

export function CardAction({ className, ...props }: CardActionProps) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				'col-start-2 row-start-1 self-center justify-self-end',
				'group-has-data-[slot=card-description]/card-header:row-span-2',
				'group-has-data-[slot=card-description]/card-header:self-start',
				className,
			)}
			{...props}
		/>
	);
}
