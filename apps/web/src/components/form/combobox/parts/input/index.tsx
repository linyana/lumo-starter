import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { fieldShell } from '@/lib/control';
import { cn } from '@/lib/utils';

export const comboboxInputVariants = tv({
	base: [
		fieldShell,
		// The shell is shared, but a field that can be typed into is the only one whose `:read-only`
		// means something — see the note on `fieldShell`.
		'read-only:bg-muted',
		// The right edge is not the text's: a caret is drawn there, and a clear button beside it.
		'pe-9',
	],
	variants: {
		size: {
			// The same 32 / 36 / 40 a Input takes, so a row of controls lines up — but padded on
			// the start only, because the end belongs to the glyphs.
			sm: 'h-8 ps-2.5 text-sm',
			md: 'h-9 ps-3 text-sm',
			lg: 'h-10 ps-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type ComboboxInputProps = Omit<
	ComponentProps<typeof BaseCombobox.Input>,
	'className' | 'size'
> &
	VariantProps<typeof comboboxInputVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * The field, and the control itself: what a reader types into to filter the list, and what shows the
 * chosen label once one is picked. It wears a Input's shell, so it is the box the focus ring is
 * drawn around and the buttons beside it never sit outside the field.
 */
export function ComboboxInput({ className, size = 'md', ...props }: ComboboxInputProps) {
	return (
		<BaseCombobox.Input
			data-slot="combobox-input"
			data-size={size}
			className={cn(comboboxInputVariants({ size }), className)}
			{...props}
		/>
	);
}
