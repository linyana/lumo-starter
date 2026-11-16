import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type CardHeaderProps = ComponentProps<'div'>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
	return (
		<div
			data-slot="card-header"
			// Two columns only when an action is present, so a title and its description stay in
			// one column and the action sits opposite both of them.
			className={cn(
				'group/card-header grid auto-rows-min items-center gap-1.5 px-(--card-pad) py-1',
				'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
				'has-data-[slot=card-description]:grid-rows-[auto_auto]',
				'has-data-[slot=card-description]:items-start',
				className,
			)}
			{...props}
		/>
	);
}
