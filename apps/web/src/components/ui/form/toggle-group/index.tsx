import { ControlSpinner } from '@/components/ui/form/loading';
import { cn } from '@/lib/utils';
import { ToggleGroupItem, ToggleGroupRoot } from './parts';
import type { ToggleGroupProps } from './types';

export const ToggleGroup = <Value extends string>({
	items,
	variant = 'ghost',
	size = 'md',
	loading = false,
	onChange,
	className,
	classNames,
	...props
}: ToggleGroupProps<Value>) => (
	<ToggleGroupRoot<Value>
		variant={variant}
		size={size}
		onValueChange={onChange}
		className={cn(className, classNames?.root)}
		{...props}
		disabled={props.disabled === true || loading}
		data-loading={loading ? '' : undefined}
		aria-busy={loading || undefined}
	>
		{items.map((item) => (
			<ToggleGroupItem<Value>
				key={item.value}
				value={item.value}
				disabled={item.disabled}
				data-loading={loading ? '' : undefined}
				aria-label={item['aria-label']}
				className={cn(classNames?.item, item.className)}
			>
				{item.icon}
				{item.label}
			</ToggleGroupItem>
		))}
		{loading && <ControlSpinner className="ms-1 text-muted-foreground" />}
	</ToggleGroupRoot>
);
