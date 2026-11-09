import { ChevronRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { cn } from '@/lib/utils';
import { caret, iconSlot, stateLayer } from '@/lib/control';
import { Transition } from './transition';

export type IconProps = ComponentProps<typeof ChevronRight>;

/** Caret that turns with the panel. Reads `data-panel-open` off the trigger. */
export function Icon({ className, ...props }: IconProps) {
	return (
		<ChevronRight
			data-slot="collapsible-icon"
			aria-hidden="true"
			className={cn(caret, className)}
			{...props}
		/>
	);
}

export type PanelProps = Omit<ComponentProps<typeof BaseCollapsible.Panel>, 'className'> & {
	/**
	 * The height the closed panel keeps, in pixels, so a folded body can still show a peek of
	 * itself. `0` means closed is out of the layout rather than short.
	 */
	peek?: number;
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * The height belongs to `Transition`: one box, gliding between the peek it is closed to and the
 * size its body takes, on the library's one size spring. There is no second animation underneath it
 * to disagree — a fold that eased to `auto` and also followed its content would be two measurements
 * of the same box, and the content swapping while it opens would be followed twice.
 *
 * Base UI still measures and owns the panel — its id, the trigger's `aria-controls`, the state
 * attributes. Only `hidden` is taken off it, because a panel that is never in the layout cannot be
 * animated between two heights; `inert` keeps the closed one out of the way instead.
 */
export function Panel({ className, peek = 0, children, ...props }: PanelProps) {
	return (
		<BaseCollapsible.Panel
			keepMounted
			render={({ hidden, ...panelProps }, state) => (
				<div
					{...panelProps}
					data-slot="collapsible-panel"
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

export const Root = BaseCollapsible.Root;

export type TriggerProps = ComponentProps<typeof BaseCollapsible.Trigger>;

export function Trigger({ className, ...props }: TriggerProps) {
	return (
		<BaseCollapsible.Trigger
			data-slot="collapsible-trigger"
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

/** Base UI supplies behaviour, these parts supply appearance. Compose with `render`. */
export const Collapsible = { Root, Trigger, Icon, Panel };
