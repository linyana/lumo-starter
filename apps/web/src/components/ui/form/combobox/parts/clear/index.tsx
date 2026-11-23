import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { clearButton } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ComboboxClearProps = Omit<ComponentProps<typeof BaseCombobox.Clear>, 'children'> & {
	children?: ReactNode;
	className?: string;
};

export function ComboboxClear({
	className,
	children,
	'aria-label': label = 'ComboboxClear selection',
	...props
}: ComboboxClearProps) {
	return (
		<BaseCombobox.Clear
			data-slot="combobox-clear"
			aria-label={label}
			className={cn(clearButton, 'absolute inset-y-0 end-8 my-auto', className)}
			{...props}
		>
			{children ?? <X />}
		</BaseCombobox.Clear>
	);
}
