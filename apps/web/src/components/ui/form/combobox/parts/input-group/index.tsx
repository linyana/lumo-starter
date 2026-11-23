import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxInputGroupProps = Omit<
	ComponentProps<typeof BaseCombobox.InputGroup>,
	'className'
> & {
	className?: string;
};

export function ComboboxInputGroup({ className, ...props }: ComboboxInputGroupProps) {
	return (
		<BaseCombobox.InputGroup
			data-slot="combobox-input-group"
			className={cn('relative', 'has-data-[slot=combobox-clear]:[&_input]:pe-16', className)}
			{...props}
		/>
	);
}
