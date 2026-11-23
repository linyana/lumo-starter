import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type FieldsetRootProps = Omit<ComponentProps<typeof BaseFieldset.Root>, 'className'> & {
	className?: string;
};

export function FieldsetRoot({ className, ...props }: FieldsetRootProps) {
	return (
		<BaseFieldset.Root
			data-slot="fieldset"
			className={cn('m-0 flex min-w-0 flex-col gap-4 border-0 p-0', className)}
			{...props}
		/>
	);
}
