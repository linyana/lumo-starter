import { ChevronDown } from 'lucide-react';
import { use, type ComponentProps } from 'react';
import { CheckboxIndicator, CheckboxRoot } from '@/components/form/checkbox/parts';
import {
	MenuItem,
	MenuPopup,
	MenuPortal,
	MenuPositioner,
	MenuRoot,
	MenuTrigger,
} from '@/components/overlay/menu/parts';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { TableContext } from '../context';
import { headControl, TableHead, type TableFixed } from '../head';

/**
 * A chosen set of rows, as data: the keys the column of boxes acts on, the keys that are chosen, and
 * the way back. It is handed to both the header and each cell, so the two can never disagree about
 * which rows are in play — the header acts on exactly what its column can see.
 */
export type TableSelection = {
	/** Every key the header's control acts on: the rows in view, not the whole data set. */
	keys: readonly string[];
	/** The chosen keys. */
	value: readonly string[];
	/** Called with the chosen keys, whole — a list, never a patch. */
	onChange: (next: string[]) => void;
	/** `radio` chooses one row at a time; a box is the default. */
	type?: 'checkbox' | 'radio';
	/** Offer all / invert / none beside the header box, where a page holds more than a few rows. */
	menu?: boolean;
};

export type TableSelectionHeadProps = Omit<ComponentProps<'th'>, 'children' | 'align'> & {
	/** The logical edge the column is set from. */
	align?: 'start' | 'center' | 'end';
	/** The chosen rows, and the way back. */
	selection: TableSelection;
	/** Pin the column, exactly as `TableHead` does. */
	fixed?: TableFixed;
	/** Merged last through `cn()`. */
	className?: string;
};

/**
 * The column of boxes: one for every row in view, and a menu that picks them all at once. It acts on
 * `selection.keys` and nothing else, which is what lets a fetched page and a shared selected set live
 * together — the header never claims a row it cannot see.
 */
export function TableSelectionHead({
	selection,
	fixed,
	className,
	...props
}: TableSelectionHeadProps) {
	const table = use(TableContext);
	const { keys, value, onChange, type = 'checkbox', menu = false } = selection;
	const all = keys.length > 0 && keys.every((key) => value.includes(key));
	const some = !all && keys.some((key) => value.includes(key));

	// One list in, one list out: the header adds or drops the keys it is responsible for and leaves
	// whatever the caller was holding on a page it can no longer see alone.
	const keep = (next: string[]) => onChange([...new Set(next)]);
	const clear = value.filter((key) => !keys.includes(key));

	return (
		<TableHead
			fixed={fixed}
			data-slot="table-selection-head"
			className={cn('w-10', className)}
			{...props}
		>
			<span data-slot="table-selection" className="flex items-center gap-1">
				{type === 'checkbox' && (
					<CheckboxRoot
						aria-label={table.locale.selectAll}
						checked={all}
						indeterminate={some}
						onCheckedChange={(next) => keep(next === true ? [...value, ...keys] : clear)}
					>
						<CheckboxIndicator />
					</CheckboxRoot>
				)}
				{type === 'checkbox' && menu && (
					<MenuRoot>
						<MenuTrigger
							aria-label={table.locale.selectOptions}
							render={
								<button
									type="button"
									data-slot="table-selection-menu"
									className={cn(headControl, iconSlot)}
								/>
							}
						>
							<ChevronDown />
						</MenuTrigger>
						<MenuPortal>
							<MenuPositioner sideOffset={6} align="start">
								<MenuPopup>
									<MenuItem onClick={() => keep([...value, ...keys])}>
										{table.locale.selectAll}
									</MenuItem>
									<MenuItem
										onClick={() => keep(clear.concat(keys.filter((key) => !value.includes(key))))}
									>
										{table.locale.selectInvert}
									</MenuItem>
									<MenuItem onClick={() => keep(clear)}>{table.locale.selectNone}</MenuItem>
								</MenuPopup>
							</MenuPositioner>
						</MenuPortal>
					</MenuRoot>
				)}
			</span>
		</TableHead>
	);
}
