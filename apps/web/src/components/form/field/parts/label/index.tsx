import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldLabelProps = Omit<ComponentProps<typeof BaseField.Label>, 'className'> & {
	className?: string;
	required?: boolean;
};

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
