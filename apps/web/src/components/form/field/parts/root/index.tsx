import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldRootProps = Omit<ComponentProps<typeof BaseField.Root>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** The state: the name the value is submitted under, the validation, and the disabled flag. */
export function FieldRoot({ className, ...props }: FieldRootProps) {
	return (
		<BaseField.Root
			data-slot="field"
			// `group`, because the control inside cannot say it failed on its own: the fact is written on
			// the field, and the shell reads it up from here.
			className={cn('group flex flex-col gap-1.5', className)}
			{...props}
		/>
	);
}
