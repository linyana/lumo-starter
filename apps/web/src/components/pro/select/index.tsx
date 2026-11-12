import { useState } from 'react';
import { LumoSelect } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { SelectProps } from './types';

/**
 * One value out of the options, in a list laid under the trigger that opened it — and the way back to
 * none, offered while one is chosen.
 *
 * The value is held here in both modes, which is what the cross needs: a select Base UI owns the value
 * of cannot be emptied from the outside, so the field keeps the default it was given and hands Base UI
 * a value either way. A caller that passes `value` still owns it; one that passes only `defaultValue`
 * gets the same component, and the same way out.
 */
export const Select = <Value extends string>({
	options,
	value,
	defaultValue,
	onChange,
	placeholder,
	size = 'md',
	disabled = false,
	name,
	id,
	required = false,
	clearable = true,
	clearLabel = 'Clear',
	className,
	classNames,
}: SelectProps<Value>) => {
	const [held, setHeld] = useState<Value | null>(defaultValue ?? null);
	const chosen = value === undefined ? held : value;
	const offered = clearable && chosen !== null && !disabled && !required;

	const choose = (next: Value | null): void => {
		if (value === undefined) setHeld(next);
		onChange?.(next);
	};

	return (
		<LumoSelect.Root
			value={chosen}
			onValueChange={choose}
			disabled={disabled}
			name={name}
			id={id}
			required={required}
		>
			<LumoSelect.TriggerGroup className={cn(className, classNames?.group)}>
				<LumoSelect.Trigger size={size} className={classNames?.trigger}>
					<LumoSelect.Value placeholder={placeholder} className={classNames?.value} />
					<LumoSelect.Icon />
				</LumoSelect.Trigger>
				{offered && (
					<LumoSelect.Clear
						label={clearLabel}
						onClick={() => choose(null)}
						className={classNames?.clear}
					/>
				)}
			</LumoSelect.TriggerGroup>
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
};
