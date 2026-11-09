import { LumoCombobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import type { ComboboxProps } from './types';

/** A select whose options are found by typing: the field is the control, and the query narrows the list. */
export const Combobox = ({
	items,
	value,
	defaultValue,
	onValueChange,
	placeholder,
	size = 'md',
	disabled = false,
	name,
	empty,
	className,
	classNames,
}: ComboboxProps) => (
	<LumoCombobox.Root
		items={items}
		value={value}
		defaultValue={defaultValue}
		onValueChange={onValueChange}
		disabled={disabled}
		name={name}
	>
		<LumoCombobox.InputGroup className={cn(className, classNames?.group)}>
			<LumoCombobox.Input size={size} placeholder={placeholder} className={classNames?.input} />
			<LumoCombobox.Trigger />
			<LumoCombobox.Clear />
		</LumoCombobox.InputGroup>
		<LumoCombobox.Portal>
			<LumoCombobox.Positioner>
				<LumoCombobox.Popup className={classNames?.popup}>
					{empty !== undefined && (
						<LumoCombobox.Empty className={classNames?.empty}>{empty}</LumoCombobox.Empty>
					)}
					<LumoCombobox.List className={classNames?.list}>
						{(item: string) => (
							<LumoCombobox.Item key={item} value={item} className={classNames?.item}>
								{item}
							</LumoCombobox.Item>
						)}
					</LumoCombobox.List>
				</LumoCombobox.Popup>
			</LumoCombobox.Positioner>
		</LumoCombobox.Portal>
	</LumoCombobox.Root>
);
