import { ToggleGroup as BaseToggleGroup, type ToggleGroupProps } from '@base-ui/react/toggle-group';
import { createContext, useContext, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
	LumoToggle,
	type LumoToggleProps,
	type ToggleSize,
	type ToggleVariant,
} from '@/components/ui/toggle';

export type ToggleGroupContextValue = {
	variant: ToggleVariant;
	size: ToggleSize;
};

/** The tier and the scale, which every item of a group shares unless it overrides one. */
export const ToggleGroupContext = createContext<ToggleGroupContextValue>({
	variant: 'ghost',
	size: 'md',
});

export function useToggleGroup() {
	return useContext(ToggleGroupContext);
}

export type RootProps<Value extends string = string> = Omit<ToggleGroupProps<Value>, 'className'> &
	Partial<ToggleGroupContextValue> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The row a set of toggles sits in. Base UI's group is what makes the set one control: one of them
 * is on at a time — or several, with `multiple` — the arrow keys move between them, and the whole
 * row is a single stop in the tab order.
 *
 * The group draws no skin of its own: no frame around the items, no track under them. A toggle
 * already carries its own edge (`outline`) or deliberately none (`ghost`), and a box drawn around a
 * row of boxes is a third edge saying nothing the row does not. What the row does own is the pair of
 * things its items must not disagree about — the space between them, and the tier and scale they are
 * drawn at — so both are set here and inherited. A run of choices that changes a panel is `Tabs`;
 * this is a run that changes a setting.
 */
export function Root<Value extends string>({
	className,
	variant = 'ghost',
	size = 'md',
	...props
}: RootProps<Value>) {
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

export type ItemProps<Value extends string = string> = Omit<
	LumoToggleProps<Value>,
	'variant' | 'size'
> & {
	/** Overrides the group's tier for this one item, which is rarely what a row wants. */
	variant?: ToggleVariant;
	/** Overrides the group's scale for this one item, which is rarely what a row wants. */
	size?: ToggleSize;
};

/** One toggle of the set. Its `value` is the word the group's state is written in. */
export function Item<Value extends string>({ variant, size, ...props }: ItemProps<Value>) {
	const group = useToggleGroup();

	return (
		<LumoToggle
			data-slot="toggle-group-item"
			variant={variant ?? group.variant}
			size={size ?? group.size}
			{...props}
		/>
	);
}

/** A set of toggles that are one control, and the row that holds them. */
export const LumoToggleGroup = { Root, Item };
