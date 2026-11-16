import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { fieldShell, iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';

export const selectTriggerVariants = tv({
	base: [
		fieldShell,
		// A field with a caret in it: the same shell a Input draws, laid out as a row so the value
		// takes the slack and the caret stays where it was put.
		'group relative flex cursor-pointer items-center justify-between gap-2 text-left select-none',
		// The resting look is a Input's: white, bordered, whatever the value is. The fill marks the
		// one state the field is in the middle of — open, and being chosen from — the way the state
		// layer marks a pressed button.
		'data-popup-open:bg-muted',
		// A button carries these as Base UI flags rather than as the pseudo-classes Input reads.
		'data-readonly:bg-muted data-readonly:cursor-default',
		iconSlot,
	],
	variants: {
		size: {
			// The same 32 / 36 / 40 a Input and a Button take, so a row of controls lines up.
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-9 px-3 text-sm',
			lg: 'h-10 px-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type SelectTriggerProps = Omit<ComponentProps<typeof BaseSelect.Trigger>, 'className'> &
	VariantProps<typeof selectTriggerVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/** The button that opens the list, holding the value and the caret. */
export function SelectTrigger({ className, size = 'md', ...props }: SelectTriggerProps) {
	return (
		<BaseSelect.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(selectTriggerVariants({ size }), className)}
			{...props}
		/>
	);
}
