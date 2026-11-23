import { useId } from 'react';
import { cn } from '@/lib/utils';
import { SwitchRoot, SwitchThumb } from './parts';
import type { SwitchProps } from './types';

export const Switch = ({
	label,
	id,
	value,
	defaultValue,
	onChange,
	className,
	classNames,
	...props
}: SwitchProps) => {
	const generated = useId();
	const inputId = id ?? generated;

	return (
		<div className={cn('flex items-center gap-2', className, classNames?.root)}>
			<SwitchRoot
				id={inputId}
				checked={value}
				defaultChecked={defaultValue}
				onCheckedChange={onChange}
				{...props}
				className={classNames?.track}
			>
				<SwitchThumb className={classNames?.thumb} />
			</SwitchRoot>
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
