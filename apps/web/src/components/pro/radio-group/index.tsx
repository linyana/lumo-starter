import { useId } from 'react';
import { LumoRadioGroup } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { RadioGroupProps } from './types';

/** Exactly one of these: the options, their labels, and the arrow keys between them. */
export const RadioGroup = <Value extends string>({
	options,
	onChange,
	className,
	classNames,
	...props
}: RadioGroupProps<Value>) => {
	const base = useId();

	return (
		<LumoRadioGroup.Root<Value>
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
						<LumoRadioGroup.Item<Value> id={id} value={option.value} disabled={option.disabled}>
							<LumoRadioGroup.Indicator className={classNames?.indicator} />
						</LumoRadioGroup.Item>
						<label
							htmlFor={id}
							className={cn('cursor-pointer text-sm select-none', classNames?.label)}
						>
							{option.label}
						</label>
					</div>
				);
			})}
		</LumoRadioGroup.Root>
	);
};
