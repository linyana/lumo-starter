import { useId, useState } from 'react';
import { ControlSpinner } from '@/components/ui/form/loading';
import { cn } from '@/lib/utils';
import { RadioGroupIndicator, RadioGroupItem, RadioGroupRoot } from './parts';
import type { RadioGroupProps } from './types';

export const RadioGroup = <Value extends string>({
	options,
	value,
	defaultValue,
	disabled = false,
	loading = false,
	onChange,
	className,
	classNames,
	...props
}: RadioGroupProps<Value>) => {
	const base = useId();
	const [held, setHeld] = useState<Value | undefined>(defaultValue ?? undefined);
	const chosen = value === undefined ? held : value;

	const choose = (...args: Parameters<NonNullable<RadioGroupProps<Value>['onChange']>>): void => {
		if (value === undefined) setHeld(args[0]);
		onChange?.(...args);
	};

	return (
		<RadioGroupRoot<Value>
			{...props}
			value={chosen}
			onValueChange={choose}
			disabled={disabled || loading}
			data-loading={loading ? '' : undefined}
			aria-busy={loading || undefined}
			className={cn(className, classNames?.root)}
		>
			{options.map((option) => {
				const id = `${base}-${option.value}`;

				return (
					<div
						key={option.value}
						className={cn('flex items-center gap-2', classNames?.item, option.className)}
					>
						<RadioGroupItem<Value>
							id={id}
							value={option.value}
							disabled={option.disabled === true || loading}
							data-loading={loading ? '' : undefined}
						>
							{loading && chosen === option.value ? (
								<ControlSpinner size="0.7em" />
							) : (
								<RadioGroupIndicator className={classNames?.indicator} />
							)}
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
