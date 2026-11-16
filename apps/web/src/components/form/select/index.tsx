import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
	SelectClear,
	SelectIcon,
	SelectItem,
	SelectItemText,
	SelectList,
	SelectPopup,
	SelectPortal,
	SelectPositioner,
	SelectRoot,
	SelectTrigger,
	SelectTriggerGroup,
	SelectValue,
} from './parts';
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
	ariaLabel,
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
		<SelectRoot
			/* The rows the trigger reads its label from. The popup is not in the DOM while it is closed, so
			   without these the trigger has nothing to call the chosen value by and falls back to the raw
			   `20`, which is the value rather than the word. */
			items={options}
			value={chosen}
			onValueChange={choose}
			disabled={disabled}
			name={name}
			id={id}
			required={required}
		>
			<SelectTriggerGroup className={cn(className, classNames?.group)}>
				<SelectTrigger size={size} className={classNames?.trigger} aria-label={ariaLabel}>
					<SelectValue placeholder={placeholder} className={classNames?.value} />
					<SelectIcon />
				</SelectTrigger>
				{offered && (
					<SelectClear
						label={clearLabel}
						onClick={() => choose(null)}
						className={classNames?.clear}
					/>
				)}
			</SelectTriggerGroup>
			<SelectPortal>
				<SelectPositioner>
					<SelectPopup className={classNames?.popup}>
						<SelectList className={classNames?.list}>
							{options.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									disabled={option.disabled}
									className={cn(classNames?.item, option.className)}
								>
									<SelectItemText>{option.label}</SelectItemText>
								</SelectItem>
							))}
						</SelectList>
					</SelectPopup>
				</SelectPositioner>
			</SelectPortal>
		</SelectRoot>
	);
};
