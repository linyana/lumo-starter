import { ToggleGroup as BaseToggleGroup, type ToggleGroupProps } from '@base-ui/react/toggle-group';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ToggleGroupContext, type ToggleGroupContextValue } from '../context';

export type ToggleGroupRootProps<Value extends string = string> = Omit<
	ToggleGroupProps<Value>,
	'className'
> &
	Partial<ToggleGroupContextValue> & {
		className?: string;
	};

export function ToggleGroupRoot<Value extends string>({
	className,
	variant = 'ghost',
	size = 'md',
	...props
}: ToggleGroupRootProps<Value>) {
	const context = useMemo(() => ({ variant, size }), [variant, size]);

	return (
		<ToggleGroupContext.Provider value={context}>
			<BaseToggleGroup
				data-slot="toggle-group"
				data-variant={variant}
				data-size={size}
				className={cn(
					'flex w-fit items-center gap-1',
					'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
					className,
				)}
				{...props}
			/>
		</ToggleGroupContext.Provider>
	);
}
