import { LumoSelect } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SelectProps } from './types';

/** One value out of the options, in a list laid under the trigger that opened it. */
export const Select = <Value extends string>({
	options,
	value,
	defaultValue,
	onValueChange,
	placeholder,
	size = 'md',
	disabled = false,
	name,
	id,
	required = false,
	className,
	classNames,
}: SelectProps<Value>) => (
	<LumoSelect.Root
		value={value}
		defaultValue={defaultValue}
		onValueChange={onValueChange}
		disabled={disabled}
		name={name}
		id={id}
		required={required}
	>
		<LumoSelect.Trigger size={size} className={cn(className, classNames?.trigger)}>
			<LumoSelect.Value placeholder={placeholder} className={classNames?.value} />
			<LumoSelect.Icon />
		</LumoSelect.Trigger>
		<LumoSelect.Portal>
			<LumoSelect.Positioner>
				<LumoSelect.Popup className={classNames?.popup}>
					<LumoSelect.List className={classNames?.list}>
						{options.map((option) => (
							<LumoSelect.Item
								key={option.value}
								value={option.value}
								disabled={option.disabled}
								className={cn(classNames?.item, option.className)}
							>
								<LumoSelect.ItemText>{option.label}</LumoSelect.ItemText>
							</LumoSelect.Item>
						))}
					</LumoSelect.List>
				</LumoSelect.Popup>
			</LumoSelect.Positioner>
		</LumoSelect.Portal>
	</LumoSelect.Root>
);
