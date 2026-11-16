import { useId } from 'react';
import { cn } from '@/lib/utils';
import { CheckboxIndicator, CheckboxRoot } from './parts';
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
			<CheckboxRoot
				id={inputId}
				checked={value}
				defaultChecked={defaultValue}
				onCheckedChange={onChange}
				{...props}
				className={classNames?.box}
			>
				<CheckboxIndicator className={classNames?.indicator} />
			</CheckboxRoot>
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
