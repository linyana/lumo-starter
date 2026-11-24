import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { scrollArea } from '@/lib/surface';
import { cn } from '@/lib/utils';

export type SelectListProps = Omit<ComponentProps<typeof BaseSelect.List>, 'className'> & {
	className?: string;
};

export function SelectList({ className, ...props }: SelectListProps) {
	return (
		<BaseSelect.List
			data-slot="select-list"
			className={cn(scrollArea, 'flex-1 py-1 scroll-py-6 outline-none', className)}
			{...props}
		/>
	);
}
