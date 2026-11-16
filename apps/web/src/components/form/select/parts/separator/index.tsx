import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { rowSeparator } from '@/lib/control';
import { cn } from '@/lib/utils';

export type SelectSeparatorProps = Omit<
	ComponentProps<typeof BaseSelect.Separator>,
	'className'
> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** A line between two groups of options. */
export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
	return (
		<BaseSelect.Separator
			data-slot="select-separator"
			className={cn(rowSeparator, className)}
			{...props}
		/>
	);
}
