import { ChevronDown } from 'lucide-react';
import { use, type ComponentProps } from 'react';
import { CheckboxIndicator, CheckboxRoot } from '@/components/ui/form/checkbox/parts';
import {
	MenuItem,
	MenuPopup,
	MenuPortal,
	MenuPositioner,
	MenuRoot,
	MenuTrigger,
} from '@/components/ui/overlay/menu/parts';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { TableContext } from '../context';
import { headControl, TableHead, type TableFixed } from '../head';

export type TableSelection = {
	keys: readonly string[];
	value: readonly string[];
	onChange: (next: string[]) => void;
	type?: 'checkbox' | 'radio';
	menu?: boolean;
};

export type TableSelectionHeadProps = Omit<ComponentProps<'th'>, 'children' | 'align'> & {
	align?: 'start' | 'center' | 'end';
	selection: TableSelection;
	fixed?: TableFixed;
	className?: string;
};

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
