import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectItemTextProps = Omit<ComponentProps<typeof BaseSelect.ItemText>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** The option's label — and, as Base UI sees it, what the trigger shows once it is chosen. */
export function SelectItemText({ className, ...props }: SelectItemTextProps) {
	return (
		<BaseSelect.ItemText
			data-slot="select-item-text"
			className={cn('min-w-0 flex-1 truncate', className)}
			{...props}
		/>
	);
}
