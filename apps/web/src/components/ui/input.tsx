import { Input as BaseInput } from '@base-ui/react/input';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { fieldShell } from '@/lib/control';

export const inputVariants = tv({
	base: [
		fieldShell,
		// A field that is settled rather than edited: still selectable, so still a field, but it reads
		// as a value being shown.
		'read-only:bg-muted',
		// A file input is a field with a button in it; the button is the browser's, so its shape is
		// settled here rather than in a part.
		'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
	],
	variants: {
		size: {
			sm: 'h-8 px-2.5 text-sm',
			md: 'h-9 px-3 text-sm',
			lg: 'h-10 px-3.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type InputProps = Omit<ComponentProps<typeof BaseInput>, 'className' | 'size'> &
	VariantProps<typeof inputVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * A single line of text. `size` is its height — the same 32/36/40 a Button takes, so the two line
 * up in a row — and never the browser's character count: the width comes from the container.
 */
export function Input({ className, size = 'md', ...props }: InputProps) {
	return (
		<BaseInput
			data-slot="input"
			data-size={size}
			className={cn(inputVariants({ size }), className)}
			{...props}
		/>
	);
}
