import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectLabelProps = ComponentProps<typeof BaseSelect.Label>;

export function SelectLabel({ className, ...props }: SelectLabelProps) {
	return (
		<BaseSelect.Label
			data-slot="select-label"
			className={cn('text-sm font-medium select-none', className)}
			{...props}
		/>
	);
}
