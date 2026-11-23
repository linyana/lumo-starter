import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps, ReactNode } from 'react';
import { Transition } from '@/components/display/transition';
import { cn } from '@/lib/utils';

export type AccordionPanelProps = Omit<
	ComponentProps<typeof BaseAccordion.Panel>,
	'className' | 'children'
> & {
	className?: string;
	peek?: number;
	children?: ReactNode;
};

export function AccordionPanel({ className, peek = 0, children, ...props }: AccordionPanelProps) {
	return (
		<BaseAccordion.Panel
			keepMounted
			render={({ hidden: _hidden, ...panelProps }, state) => (
				<div
					{...panelProps}
					data-slot="accordion-panel"
					inert={!state.open}
					className={cn('overflow-clip', className)}
				>
					<Transition height={state.open ? undefined : peek}>{children}</Transition>
				</div>
			)}
			{...props}
		/>
	);
}
