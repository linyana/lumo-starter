import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type AccordionHeaderProps = Omit<
	ComponentProps<typeof BaseAccordion.Header>,
	'className'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The heading the trigger sits in. Base UI renders an `h3`, which is a guess at where the list sits in
 * the page: `render={<h2 />}` is how a call site says otherwise, so the level stays the page's
 * business rather than the component's.
 */
export function AccordionHeader({ className, ...props }: AccordionHeaderProps) {
	return (
		<BaseAccordion.Header
			data-slot="accordion-header"
			className={cn('flex', className)}
			{...props}
		/>
	);
}
