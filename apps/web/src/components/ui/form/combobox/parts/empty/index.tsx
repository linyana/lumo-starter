import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxEmptyProps = Omit<ComponentProps<typeof BaseCombobox.Empty>, 'className'> & {
	className?: string;
};

export function ComboboxEmpty({ className, children, ...props }: ComboboxEmptyProps) {
	return (
		<BaseCombobox.Empty data-slot="combobox-empty" {...props}>
			<div className={cn('px-4 py-6 text-center text-sm text-muted-foreground', className)}>
				{children ?? 'no match.'}
			</div>
		</BaseCombobox.Empty>
	);
}
