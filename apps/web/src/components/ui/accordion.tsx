import { Accordion as BaseAccordion, type AccordionRootProps } from '@base-ui/react/accordion';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { caret, iconSlot, stateLayer } from '@/lib/control';
import { LumoTransition } from '@/components/ui/transition';

export type RootProps<Value = unknown> = Omit<AccordionRootProps<Value>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A list of folds that share one value: one of them open at a time, or several with `multiple`. Base
 * UI owns the value, the trigger's `aria-expanded`, and the fact that a fold inside this list is one of
 * a set rather than a panel of its own.
 *
 * The rows are divided rather than framed — a hairline between two of them and none at either end,
 * which is the whole of what the list draws. A row is exactly a collapsible's: an answer folded under
 * the question that asks for it, turning the same caret on the same spring.
 */
export function Root<Value = unknown>({ className, ...props }: RootProps<Value>) {
	return (
		<BaseAccordion.Root
			data-slot="accordion"
			className={cn('w-full divide-y divide-border', className)}
			{...props}
		/>
	);
}

export type ItemProps = Omit<ComponentProps<typeof BaseAccordion.Item>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/** One question and its answer. The item is the box the hairline under it belongs to. */
export function Item({ className, ...props }: ItemProps) {
	return (
		<BaseAccordion.Item
			data-slot="accordion-item"
			className={cn('min-w-0', className)}
			{...props}
		/>
	);
}

export type HeaderProps = Omit<ComponentProps<typeof BaseAccordion.Header>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The heading the trigger sits in. Base UI renders an `h3`, which is a guess at where the list sits in
 * the page: `render={<h2 />}` is how a call site says otherwise, so the level stays the page's
 * business rather than the component's.
 */
export function Header({ className, ...props }: HeaderProps) {
	return (
		<BaseAccordion.Header
			data-slot="accordion-header"
			className={cn('flex', className)}
			{...props}
		/>
	);
}

export type TriggerProps = Omit<ComponentProps<typeof BaseAccordion.Trigger>, 'className'> & {
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The row you press. The same appearance as a collapsible's trigger, `group` included, because the
 * caret inside it reads the open state off this element — and a row that opened a panel without saying
 * so in the same way would be a second kind of disclosure in one library.
 */
export function Trigger({ className, ...props }: TriggerProps) {
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

/** The caret, turning with the panel. */
export function Icon({ className, ...props }: ComponentProps<typeof ChevronRight>) {
	return (
		<ChevronRight
			data-slot="accordion-icon"
			aria-hidden="true"
			className={cn(caret, className)}
			{...props}
		/>
	);
}

export type PanelProps = Omit<
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
 * The answer, folded. Its height belongs to `LumoTransition` — the same glide the collapsible uses, so an
 * accordion row and a lone fold open at the same speed.
 *
 * Base UI still measures and owns the panel: its id, the trigger's `aria-controls`, the state
 * attributes. Only `hidden` is taken off it, because a panel that is never in the layout cannot be
 * animated between two heights; `inert` keeps the closed one out of the way and out of the tab order
 * instead.
 */
export function Panel({ className, peek = 0, children, ...props }: PanelProps) {
	return (
		<BaseAccordion.Panel
			keepMounted
			render={({ hidden, ...panelProps }, state) => (
				<div
					{...panelProps}
					data-slot="accordion-panel"
					inert={!state.open}
					className={cn('overflow-clip', className)}
				>
					<LumoTransition height={state.open ? undefined : peek}>{children}</LumoTransition>
				</div>
			)}
			{...props}
		/>
	);
}

/** A list of folds that are one list, and the parts each fold is made of. */
export const LumoAccordion = { Root, Item, Header, Trigger, Icon, Panel };
