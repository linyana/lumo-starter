import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import type { ComponentProps, ReactNode } from 'react';
import { Transition } from '@/components/display/transition';
import { cn } from '@/lib/utils';

export type AccordionPanelProps = Omit<
	ComponentProps<typeof BaseAccordion.Panel>,
	'className' | 'children'
> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
	/**
	 * The height the folded panel keeps, in pixels, so a closed answer can still show a line of
	 * itself. `0` means closed is out of the layout rather than short.
	 */
	peek?: number;
	children?: ReactNode;
};

/**
 * The answer, folded. Its height belongs to `Transition` — the same glide the collapsible uses, so an
 * accordion row and a lone fold open at the same speed.
 *
 * Base UI still measures and owns the panel: its id, the trigger's `aria-controls`, the state
 * attributes. Only `hidden` is taken off it, because a panel that is never in the layout cannot be
 * animated between two heights; `inert` keeps the closed one out of the way and out of the tab order
 * instead.
 */
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
