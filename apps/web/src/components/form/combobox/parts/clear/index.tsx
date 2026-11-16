import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { X } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { clearButton } from '@/lib/control';
import { cn } from '@/lib/utils';

export type ComboboxClearProps = Omit<ComponentProps<typeof BaseCombobox.Clear>, 'children'> & {
	/** Replaces the cross. */
	children?: ReactNode;
	/** Merged with `cn()`. */
	className?: string;
};

/**
 * The way back to an empty field. Base UI mounts it only while there is something to clear, which is
 * what the field's extra room on the end is keyed to — and it is the library's cross, the same button
 * an input, a textarea and a select draw, measured against the caret beside it rather than the edge.
 */
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
