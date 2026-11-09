import type { ComponentProps } from 'react';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import { cn } from '@/lib/utils';

export type SeparatorProps = ComponentProps<typeof BaseSeparator>;

export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
	return (
		<BaseSeparator
			data-slot="separator"
			orientation={orientation}
			className={cn(
				'shrink-0 bg-border',
				orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
				className,
			)}
			{...props}
		/>
	);
}
