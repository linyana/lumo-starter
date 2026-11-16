import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';

export type AccordionTriggerProps = Omit<
	ComponentProps<typeof BaseAccordion.Trigger>,
	'className'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The row you press. The same appearance as a collapsible's trigger, `group` included, because the
 * caret inside it reads the open state off this element — and a row that opened a panel without saying
 * so in the same way would be a second kind of disclosure in one library.
 */
export function AccordionTrigger({ className, ...props }: AccordionTriggerProps) {
	return (
		<BaseAccordion.Trigger
			data-slot="accordion-trigger"
			className={cn(
				'group relative flex w-full cursor-pointer items-center justify-between gap-2',
				'rounded-md px-3 py-2 text-left text-sm font-medium select-none',
				stateLayer,
				'data-disabled:pointer-events-none data-disabled:opacity-50',
				iconSlot,
				className,
			)}
			{...props}
		/>
	);
}
