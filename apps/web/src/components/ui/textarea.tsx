import { Field } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { fieldShell } from '@/lib/control';

export const textareaVariants = tv({
	// `read-only` is the textarea's own: the shell is shared with controls that cannot be typed into,
	// where `:read-only` matches for their whole life.
	base: [fieldShell, 'read-only:bg-muted', 'resize-y'],
	variants: {
		size: {
			sm: 'min-h-16 px-2.5 py-1.5 text-sm',
			md: 'min-h-20 px-3 py-2 text-sm',
			lg: 'min-h-24 px-3.5 py-2.5 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type LumoTextareaProps = Omit<ComponentProps<'textarea'>, 'className'> &
	VariantProps<typeof textareaVariants> & {
		/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
		className?: string;
	};

/**
 * Several lines of text. The element is the browser's — there is no Base UI textarea — and it is
 * mounted through `LumoField.Control`, which is what hands it an id, a describedby and the invalid
 * flag when a field is above it. Its `size` is a minimum height; the height itself is `rows`, or
 * the corner the reader drags.
 */
export function LumoTextarea({ className, size = 'md', ...props }: LumoTextareaProps) {
	return (
		<Field.Control
			render={
				<textarea
					data-slot="textarea"
					data-size={size}
					className={cn(textareaVariants({ size }), className)}
					{...props}
				/>
			}
		/>
	);
}
