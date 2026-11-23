import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { rowGroupLabel } from '@/lib/control';
import { cn } from '@/lib/utils';

export type SelectGroupLabelProps = Omit<
	ComponentProps<typeof BaseSelect.GroupLabel>,
	'className'
> & {
	className?: string;
};

export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
	return (
		<BaseSelect.GroupLabel
			data-slot="select-group-label"
			className={cn(rowGroupLabel, className)}
			{...props}
		/>
	);
}
