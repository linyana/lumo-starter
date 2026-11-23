import { Field as BaseField } from '@base-ui/react/field';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldRootProps = Omit<ComponentProps<typeof BaseField.Root>, 'className'> & {
	className?: string;
};

export function FieldRoot({ className, ...props }: FieldRootProps) {
	return (
		<BaseField.Root
			data-slot="field"
			className={cn('group flex flex-col gap-1.5', className)}
			{...props}
		/>
	);
}
