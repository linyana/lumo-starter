import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { rowGroupLabel } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ComboboxGroupLabelProps = Omit<
	ComponentProps<typeof BaseCombobox.GroupLabel>,
	'className'
> & {
	className?: string;
};

export function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
	return (
		<BaseCombobox.GroupLabel
			data-slot="combobox-group-label"
			className={cn(rowGroupLabel, className)}
			{...props}
		/>
	);
}
