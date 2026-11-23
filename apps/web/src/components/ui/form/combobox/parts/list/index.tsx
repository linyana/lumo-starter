import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxListProps = Omit<ComponentProps<typeof BaseCombobox.List>, 'className'> & {
	className?: string;
};

export function ComboboxList({ className, ...props }: ComboboxListProps) {
	return (
		<BaseCombobox.List
			data-slot="combobox-list"
			className={cn(
				'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 scroll-py-6 outline-none',
				className,
			)}
			{...props}
		/>
	);
}
