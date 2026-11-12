import { LumoToggleGroup } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import type { ToggleGroupProps } from './types';

/** A run of toggles that are one control: one of them on at a time, or several. */
export const ToggleGroup = <Value extends string>({
	items,
	variant = 'ghost',
	size = 'md',
	onChange,
	className,
	classNames,
	...props
}: ToggleGroupProps<Value>) => (
	<LumoToggleGroup.Root<Value>
		variant={variant}
		size={size}
		onValueChange={onChange}
		className={cn(className, classNames?.root)}
		{...props}
	>
		{items.map((item) => (
			<LumoToggleGroup.Item<Value>
				key={item.value}
				value={item.value}
				disabled={item.disabled}
				aria-label={item['aria-label']}
				className={cn(classNames?.item, item.className)}
			>
				{item.icon}
				{item.label}
			</LumoToggleGroup.Item>
		))}
	</LumoToggleGroup.Root>
);
