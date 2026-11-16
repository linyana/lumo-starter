import {
	Toggle,
	type ToggleProps,
	type ToggleSize,
	type ToggleVariant,
} from '@/components/form/toggle';
import { useToggleGroup } from '../context';

export type ToggleGroupItemProps<Value extends string = string> = Omit<
	ToggleProps<Value>,
	'variant' | 'size'
> & {
	/** Overrides the group's tier for this one item, which is rarely what a row wants. */
	variant?: ToggleVariant;
	/** Overrides the group's scale for this one item, which is rarely what a row wants. */
	size?: ToggleSize;
};

/** One toggle of the set. Its `value` is the word the group's state is written in. */
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
