import { Select as BaseSelect } from '@base-ui/react/select';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { scrollArrowClass } from '../scroll-up-arrow';

export type SelectScrollDownArrowProps = ComponentProps<typeof BaseSelect.ScrollDownArrow>;

export function SelectScrollDownArrow({ className, ...props }: SelectScrollDownArrowProps) {
	return (
		<BaseSelect.ScrollDownArrow
			data-slot="select-scroll-down-arrow"
			className={cn(scrollArrowClass, className)}
			{...props}
		>
			<ChevronDown />
		</BaseSelect.ScrollDownArrow>
	);
}
