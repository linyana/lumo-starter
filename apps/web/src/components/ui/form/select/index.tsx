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

export type { SelectOption, SelectProps, SelectSlots } from './types';

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
