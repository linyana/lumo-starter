import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldDescriptionProps = Omit<
	ComponentProps<typeof BaseField.Description>,
	'className'
> & {
	className?: string;
};

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
	return (
		<BaseField.Description
			data-slot="field-description"
			className={cn('text-sm text-muted-foreground data-disabled:opacity-50', className)}
			{...props}
		/>
	);
}
