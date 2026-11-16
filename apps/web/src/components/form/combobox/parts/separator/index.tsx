import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { rowSeparator } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ComboboxSeparatorProps = Omit<
	ComponentProps<typeof BaseCombobox.Separator>,
	'className'
> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** A line between two groups of options. */
export function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
	return (
		<BaseCombobox.Separator
			data-slot="combobox-separator"
			className={cn(rowSeparator, className)}
			{...props}
		/>
	);
}
