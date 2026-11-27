import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowVariant } from '@/lib/control';
import { cn } from '@/lib/utils';

export type SelectItemProps = Omit<ComponentProps<typeof BaseSelect.Item>, 'className'> & {
	className?: string;
	variant?: RowVariant;
};

export function SelectItem({ className, variant = 'default', ...props }: SelectItemProps) {
	return (
		<BaseSelect.Item
			data-slot="select-item"
			data-variant={variant}
			className={cn(
				row,
				'cursor-pointer pr-3',
				variant === 'destructive' && rowDestructive,
				className,
			)}
			{...props}
		/>
	);
}
