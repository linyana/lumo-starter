import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type ComboboxListProps = Omit<ComponentProps<typeof BaseCombobox.List>, 'className'> & {
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The rows. `children` is a function when the root was given `items` — one call per item, so the
 * filtering happens in Base UI and never in a `filter` the caller has to keep in step.
 */
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
