import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldLabelProps = Omit<ComponentProps<typeof BaseField.Label>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

export function FieldLabel({ className, ...props }: FieldLabelProps) {
	return (
		<BaseField.Label
			data-slot="field-label"
			className={cn('text-sm font-medium select-none data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}
