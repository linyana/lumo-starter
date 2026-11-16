import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type SelectPositionerProps = ComponentProps<typeof BaseSelect.Positioner>;

/**
 * Where the list is placed. Base UI aligns the selected row with the trigger by default, which lays
 * the popup over the control that opened it; here it is off, so a select opens under its trigger like
 * every other surface in the library. Pass `alignItemWithTrigger` for the native feel of a list
 * covering the row it belongs to.
 */
export function SelectPositioner({
	className,
	align = 'start',
	sideOffset = 6,
	alignItemWithTrigger = false,
	...props
}: SelectPositionerProps) {
	return (
		<BaseSelect.Positioner
			data-slot="select-positioner"
			align={align}
			sideOffset={sideOffset}
			alignItemWithTrigger={alignItemWithTrigger}
			className={cn('z-50 outline-none', positioner, className)}
			{...props}
		/>
	);
}
