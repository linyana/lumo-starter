import { Select as BaseSelect } from '@base-ui/react/select';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type SelectListProps = Omit<ComponentProps<typeof BaseSelect.List>, 'className'> & {
	className?: string;
};

export function SelectList({ className, ...props }: SelectListProps) {
	return (
		<BaseSelect.List
			data-slot="select-list"
			className={cn(
				'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 scroll-py-6 outline-none',
				className,
			)}
			{...props}
		/>
	);
}
