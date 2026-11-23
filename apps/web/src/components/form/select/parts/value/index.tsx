import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectValueProps = Omit<ComponentProps<typeof BaseSelect.Value>, 'className'> & {
	className?: string;
};

export function SelectValue({ className, ...props }: SelectValueProps) {
	return (
		<BaseSelect.Value
			data-slot="select-value"
			className={cn('min-w-0 flex-1 truncate', 'data-placeholder:text-muted-foreground', className)}
			{...props}
		/>
	);
}
