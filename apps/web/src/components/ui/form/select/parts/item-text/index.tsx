import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectItemTextProps = Omit<ComponentProps<typeof BaseSelect.ItemText>, 'className'> & {
	className?: string;
};

export function SelectItemText({ className, ...props }: SelectItemTextProps) {
	return (
		<BaseSelect.ItemText
			data-slot="select-item-text"
			className={cn('min-w-0 flex-1 truncate', className)}
			{...props}
		/>
	);
}
