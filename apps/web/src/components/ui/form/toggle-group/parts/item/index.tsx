import {
	Toggle,
	type ToggleProps,
	type ToggleSize,
	type ToggleVariant,
} from '@/components/ui/form/toggle';
import { useToggleGroup } from '../context';

export type ToggleGroupItemProps<Value extends string = string> = Omit<
	ToggleProps<Value>,
	'variant' | 'size'
> & {
	variant?: ToggleVariant;
	size?: ToggleSize;
};

export function ToggleGroupItem<Value extends string>({
	variant,
	size,
	...props
}: ToggleGroupItemProps<Value>) {
	const group = useToggleGroup();

	return (
		<Toggle
			data-slot="toggle-group-item"
			variant={variant ?? group.variant}
			size={size ?? group.size}
			{...props}
		/>
	);
}
