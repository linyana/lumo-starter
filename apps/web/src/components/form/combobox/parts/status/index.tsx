import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxStatusProps = Omit<ComponentProps<typeof BaseCombobox.Status>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/** The line a screen reader hears when the list changes under it. Read, never seen. */
export function ComboboxStatus({ className, ...props }: ComboboxStatusProps) {
	return (
		<BaseCombobox.Status
			data-slot="combobox-status"
			className={cn('sr-only', className)}
			{...props}
		/>
	);
}
