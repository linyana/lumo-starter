import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowTone } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ComboboxItemProps = Omit<ComponentProps<typeof BaseCombobox.Item>, 'className'> & {
	className?: string;
	tone?: RowTone;
};

export function ComboboxItem({ className, tone = 'default', ...props }: ComboboxItemProps) {
	return (
		<BaseCombobox.Item
			data-slot="combobox-item"
			data-tone={tone}
			className={cn(
				row,
				'cursor-pointer pr-3',
				tone === 'destructive' && rowDestructive,
				className,
			)}
			{...props}
		/>
	);
}
