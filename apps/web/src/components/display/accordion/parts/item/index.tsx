import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AccordionItemProps = Omit<ComponentProps<typeof BaseAccordion.Item>, 'className'> & {
	className?: string;
};

export function AccordionItem({ className, ...props }: AccordionItemProps) {
	return (
		<BaseAccordion.Item
			data-slot="accordion-item"
			className={cn('min-w-0', className)}
			{...props}
		/>
	);
}
