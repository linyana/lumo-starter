import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldItemProps = Omit<ComponentProps<typeof BaseField.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * One entry in a group that shares a field: the label and the sentence beside it, beside the
 * control. `items-start` is the default because a description under a label is usual here, and a
 * checkbox that centred itself against a paragraph would drift off its own first line.
 */
export function FieldItem({ className, ...props }: FieldItemProps) {
	return (
		<BaseField.Item
			data-slot="field-item"
			className={cn('flex items-start gap-2', className)}
			{...props}
		/>
	);
}
