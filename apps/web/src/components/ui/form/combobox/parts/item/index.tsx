import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowVariant } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ComboboxItemProps = Omit<ComponentProps<typeof BaseCombobox.Item>, 'className'> & {
	className?: string;
	variant?: RowVariant;
};

export function ComboboxItem({ className, variant = 'default', ...props }: ComboboxItemProps) {
	return (
		<BaseCombobox.Item
			data-slot="combobox-item"
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
