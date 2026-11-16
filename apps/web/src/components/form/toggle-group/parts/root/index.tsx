import { ToggleGroup as BaseToggleGroup, type ToggleGroupProps } from '@base-ui/react/toggle-group';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ToggleGroupContext, type ToggleGroupContextValue } from '../context';

export type ToggleGroupRootProps<Value extends string = string> = Omit<
	ToggleGroupProps<Value>,
	'className'
> &
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
