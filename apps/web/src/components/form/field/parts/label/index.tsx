import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldLabelProps = Omit<ComponentProps<typeof BaseField.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/** Whether the field must be answered — the mark drawn before the name. */
	required?: boolean;
};

/**
 * The name of the field, and the mark of one that must be answered. The mark is a glyph, so the same
 * fact is also said in words — in the label rather than on the control, whose role may be a group of
 * buttons that `aria-required` has nothing to say about.
 */
export function FieldLabel({ required = false, className, children, ...props }: FieldLabelProps) {
	return (
		<BaseField.Label
			data-slot="field-label"
			className={cn('text-sm font-medium select-none data-disabled:opacity-50', className)}
			{...props}
		>
			{required && (
				<span aria-hidden className="me-0.5 text-destructive">
					*
				</span>
			)}
			{children}
			{required && <span className="sr-only"> (required)</span>}
		</BaseField.Label>
	);
}
