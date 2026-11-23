import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AccordionHeaderProps = Omit<
	ComponentProps<typeof BaseAccordion.Header>,
	'className'
> & {
	className?: string;
};

export function AccordionHeader({ className, ...props }: AccordionHeaderProps) {
	return (
		<BaseAccordion.Header
			data-slot="accordion-header"
			className={cn('flex', className)}
			{...props}
		/>
	);
}
