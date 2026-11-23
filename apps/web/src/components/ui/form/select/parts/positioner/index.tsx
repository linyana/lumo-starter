import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { positioner } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type SelectPositionerProps = ComponentProps<typeof BaseSelect.Positioner>;

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
