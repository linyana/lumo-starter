import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { row, rowDestructive, type RowTone } from '@/lib/control';
import { cn } from '@/lib/utils';

export type SelectItemProps = Omit<ComponentProps<typeof BaseSelect.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** What choosing the option does, drawn in the colour of a consequence. */
	tone?: RowTone;
};

/**
 * One option. The row is the library's own, so it highlights exactly as a menu's action does — and the
 * chosen one is filled with that same tint rather than marked, so the label never shifts between the
 * two states, deepening a notch while the pointer is still on it. The cursor is a pointer, unlike a
 * menu row's: this is a thing to pick out of a list.
 */
export function SelectItem({ className, tone = 'default', ...props }: SelectItemProps) {
	return (
		<BaseSelect.Item
			data-slot="select-item"
			data-tone={tone}
			className={cn(
				row,
				'cursor-pointer pr-3',
				tone === 'destructive' && rowDestructive,
				className,
			)}
			{...props}
		/>
	);
}
