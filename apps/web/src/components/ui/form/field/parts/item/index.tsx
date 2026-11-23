import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldItemProps = Omit<ComponentProps<typeof BaseField.Item>, 'className'> & {
	className?: string;
};

export function FieldItem({ className, ...props }: FieldItemProps) {
	return (
		<BaseField.Item
			data-slot="field-item"
			className={cn('flex items-start gap-2', className)}
			{...props}
		/>
	);
}
