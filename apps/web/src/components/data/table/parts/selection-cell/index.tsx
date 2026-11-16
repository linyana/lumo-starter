import type { ComponentProps } from 'react';
import { CheckboxIndicator, CheckboxRoot } from '@/components/form/checkbox/parts';
import {
	RadioGroupIndicator,
	RadioGroupItem,
	RadioGroupRoot,
} from '@/components/form/radio-group/parts';
import { cn } from '@/lib/utils';
import { TableCell } from '../cell';
import type { TableFixed } from '../head';
import type { TableSelection } from '../selection-head';

export type TableSelectionCellProps = Omit<ComponentProps<'td'>, 'children' | 'align'> & {
	/** The logical edge the cell is set from. */
	align?: 'start' | 'center' | 'end';
	/** The chosen rows, and the way back — the same object the header was given. */
	selection: TableSelection;
	/** The key of the record this box belongs to. */
	value: string;
	/** What a screen reader hears instead of the key: the record's own name. */
	label?: string;
	/** A record that cannot be chosen. */
	disabled?: boolean;
	/** Pin the column, exactly as `TableCell` does. */
	fixed?: TableFixed;
	/** Merged last through `cn()`. */
	className?: string;
};

/** One box, for one record, belonging to the set the header is holding. */
export function TableSelectionCell({
	selection,
	value,
	label,
	disabled = false,
	fixed,
	className,
	...props
}: TableSelectionCellProps) {
	const { value: chosen, onChange, type = 'checkbox' } = selection;
	const checked = chosen.includes(value);
	const name = label ?? value;

	return (
		<TableCell
			fixed={fixed}
			data-slot="table-selection-cell"
			className={cn('w-10', className)}
			{...props}
		>
			{type === 'radio' ? (
				<RadioGroupRoot
					value={checked ? value : null}
					disabled={disabled}
					onValueChange={() => onChange([value])}
				>
					<RadioGroupItem value={value} aria-label={name}>
						<RadioGroupIndicator />
					</RadioGroupItem>
				</RadioGroupRoot>
			) : (
				<CheckboxRoot
					aria-label={name}
					checked={checked}
					disabled={disabled}
					onCheckedChange={(next) =>
						onChange(next === true ? [...chosen, value] : chosen.filter((one) => one !== value))
					}
				>
					<CheckboxIndicator />
				</CheckboxRoot>
			)}
		</TableCell>
	);
}
