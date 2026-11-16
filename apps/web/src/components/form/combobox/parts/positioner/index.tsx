import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type ComboboxPositionerProps = ComponentProps<typeof BaseCombobox.Positioner>;

/** Where the list is placed: under the field, as wide as it, on the same offset Select uses. */
export function ComboboxPositioner({
	className,
	align = 'start',
	sideOffset = 6,
	...props
}: ComboboxPositionerProps) {
	return (
		<BaseCombobox.Positioner
			data-slot="combobox-positioner"
			align={align}
			sideOffset={sideOffset}
			className={cn('z-50 outline-none', positioner, className)}
			{...props}
		/>
	);
}
