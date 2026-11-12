import { useId } from 'react';
import { LumoCheckbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { CheckboxProps } from './types';

/** A box, the tick inside it, and the word that says what it is for. */
export const Checkbox = ({
	label,
	id,
	value,
	defaultValue,
	onChange,
	className,
	classNames,
	...props
}: CheckboxProps) => {
	const generated = useId();
	const inputId = id ?? generated;

	return (
		<div className={cn('flex items-center gap-2', className, classNames?.root)}>
			<LumoCheckbox.Root
				id={inputId}
				checked={value}
				defaultChecked={defaultValue}
				onCheckedChange={onChange}
				{...props}
				className={classNames?.box}
			>
				<LumoCheckbox.Indicator className={classNames?.indicator} />
			</LumoCheckbox.Root>
			{label !== undefined && (
				<label
					htmlFor={inputId}
					className={cn('cursor-pointer text-sm select-none', classNames?.label)}
				>
					{label}
				</label>
			)}
		</div>
	);
};
