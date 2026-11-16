import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SwitchThumbProps = Omit<ComponentProps<typeof BaseSwitch.Thumb>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The knob. It travels the track's inner width — 36 less the padding and its own 16. */
export function SwitchThumb({ className, ...props }: SwitchThumbProps) {
	return (
		<BaseSwitch.Thumb
			data-slot="switch-thumb"
			className={cn(
				'pointer-events-none block size-4 rounded-full bg-background shadow-sm',
				'transition-transform duration-(--duration-state) ease-(--ease-spring)',
				'data-checked:translate-x-4',
				className,
			)}
			{...props}
		/>
	);
}
