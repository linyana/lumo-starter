import { useId } from 'react';
import { LumoSwitch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { SwitchProps } from './types';

/** A track and a knob: on or off, in the space of one line of text. */
export const Switch = ({ label, id, className, classNames, ...props }: SwitchProps) => {
	const generated = useId();
	const inputId = id ?? generated;

	return (
		<div className={cn('flex items-center gap-2', className, classNames?.root)}>
			<LumoSwitch.Root id={inputId} {...props} className={classNames?.track}>
				<LumoSwitch.Thumb className={classNames?.thumb} />
			</LumoSwitch.Root>
			{label !== undefined && (
				<label
					htmlFor={inputId}
					className={cn('cursor-pointer text-sm select-none', classNames?.label)}
				>
					{label}
				</label>
			)}
		</div>
	);
};
