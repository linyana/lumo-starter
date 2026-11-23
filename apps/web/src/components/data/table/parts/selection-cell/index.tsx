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
	align?: 'start' | 'center' | 'end';
	selection: TableSelection;
	value: string;
	label?: string;
	disabled?: boolean;
	fixed?: TableFixed;
	className?: string;
};

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
