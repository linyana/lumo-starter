import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type RootProps = Omit<ComponentProps<typeof BaseSwitch.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The track. Base UI writes `data-checked` on it and on the thumb, so the look of the whole
 * control is one selector away at either end.
 *
 * Off, the track is the field's own edge and moves like one: one step darker under the pointer, one
 * step darker in focus, and no outline. On, it is already `--primary` and there is no darker step
 * left to take, so it keeps the ring — a filled track has nothing else to say with colour.
 */
export function Root({ className, ...props }: RootProps) {
	return (
		<BaseSwitch.Root
			data-slot="switch"
			className={cn(
				'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5',
				'bg-input transition-colors duration-(--duration-state)',
				'hover:not-disabled:not-data-disabled:not-data-checked:bg-input-strong',
				'not-data-checked:focus-visible:bg-input-strong',
				'not-data-checked:focus-visible:outline-none',
				'data-checked:bg-primary',
				'data-disabled:cursor-not-allowed data-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export type ThumbProps = Omit<ComponentProps<typeof BaseSwitch.Thumb>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The knob. It travels the track's inner width — 36 less the padding and its own 16. */
export function Thumb({ className, ...props }: ThumbProps) {
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

/** A track and a knob: on or off, in the space of one line of text. */
export const LumoSwitch = { Root, Thumb };
