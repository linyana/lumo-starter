import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AccordionItemProps = Omit<ComponentProps<typeof BaseAccordion.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One question and its answer. The item is the box the hairline under it belongs to. */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
	return (
		<BaseAccordion.Item
			data-slot="accordion-item"
			className={cn('min-w-0', className)}
			{...props}
		/>
	);
}
