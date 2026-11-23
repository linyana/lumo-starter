import { cn } from '@/lib/utils';
import {
	ComboboxClear,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxInputGroup,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxPortal,
	ComboboxPositioner,
	ComboboxRoot,
	ComboboxTrigger,
} from './parts';
import type { ComboboxProps } from './types';

export const Combobox = ({
	items,
	value,
	defaultValue,
	onChange,
	placeholder,
	size = 'md',
	disabled = false,
	name,
	empty,
	className,
	classNames,
}: ComboboxProps) => (
	<ComboboxRoot
		items={items}
		value={value}
		defaultValue={defaultValue}
		onValueChange={onChange}
		disabled={disabled}
		name={name}
	>
		<ComboboxInputGroup className={cn(className, classNames?.group)}>
			<ComboboxInput size={size} placeholder={placeholder} className={classNames?.input} />
			<ComboboxTrigger />
			<ComboboxClear />
		</ComboboxInputGroup>
		<ComboboxPortal>
			<ComboboxPositioner>
				<ComboboxPopup className={classNames?.popup}>
					{empty !== undefined && (
						<ComboboxEmpty className={classNames?.empty}>{empty}</ComboboxEmpty>
					)}
					<ComboboxList className={classNames?.list}>
						{(item: string) => (
							<ComboboxItem key={item} value={item} className={classNames?.item}>
								{item}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxPopup>
			</ComboboxPositioner>
		</ComboboxPortal>
	</ComboboxRoot>
);
