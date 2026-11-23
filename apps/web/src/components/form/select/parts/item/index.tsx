import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowTone } from '@/lib/control';
import { cn } from '@/lib/utils';

export type SelectItemProps = Omit<ComponentProps<typeof BaseSelect.Item>, 'className'> & {
	className?: string;
	tone?: RowTone;
};

export function SelectItem({ className, tone = 'default', ...props }: SelectItemProps) {
	return (
		<BaseSelect.Item
			data-slot="select-item"
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
