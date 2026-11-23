import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type StepsTitleProps = ComponentProps<'div'>;

export function StepsTitle({ className, ...props }: StepsTitleProps) {
	return (
		<div
			data-slot="steps-title"
			className={cn(
				'font-medium text-balance',
				'group-data-[status=error]/step:text-destructive',
				className,
			)}
			{...props}
		/>
	);
}
