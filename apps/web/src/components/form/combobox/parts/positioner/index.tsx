import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type ComboboxPositionerProps = ComponentProps<typeof BaseCombobox.Positioner>;

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
