import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps } from 'react';
import { iconSlot, stateLayer } from '@/lib/control';
import { cn } from '@/lib/utils';

export type AccordionTriggerProps = Omit<
	ComponentProps<typeof BaseAccordion.Trigger>,
	'className'
> & {
	className?: string;
};

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
