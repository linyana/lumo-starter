import { useId } from 'react';
import { cn } from '@/lib/utils';
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from './parts';
import type { RadioGroupProps } from './types';

export const RadioGroup = <Value extends string>({
	options,
	onChange,
	className,
	classNames,
	...props
}: RadioGroupProps<Value>) => {
	const base = useId();

	return (
		<RadioGroupRoot<Value>
			onValueChange={onChange}
			className={cn(className, classNames?.root)}
			{...props}
		>
			{options.map((option) => {
				const id = `${base}-${option.value}`;

				return (
					<div
						key={option.value}
						className={cn('flex items-center gap-2', classNames?.item, option.className)}
					>
						<RadioGroupItem<Value> id={id} value={option.value} disabled={option.disabled}>
							<RadioGroupIndicator className={classNames?.indicator} />
						</RadioGroupItem>
						<label
							htmlFor={id}
							className={cn('cursor-pointer text-sm select-none', classNames?.label)}
						>
							{option.label}
						</label>
					</div>
				);
			})}
		</RadioGroupRoot>
	);
};
