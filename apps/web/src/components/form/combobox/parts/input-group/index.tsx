import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxInputGroupProps = Omit<
	ComponentProps<typeof BaseCombobox.InputGroup>,
	'className'
> & {
	/** Merged with `cn()`. A `w-56` here is what narrows the control. */
	className?: string;
};

/**
 * The box the field and its buttons share. It holds no look of its own — the field does — and exists
 * to be the corner the caret and the clear button are placed against. The field's room on the end
 * grows while a clear button is mounted, so an absent button leaves no gap.
 */
export function ComboboxInputGroup({ className, ...props }: ComboboxInputGroupProps) {
	return (
		<BaseCombobox.InputGroup
			data-slot="combobox-input-group"
			className={cn('relative', 'has-data-[slot=combobox-clear]:[&_input]:pe-16', className)}
			{...props}
		/>
	);
}
