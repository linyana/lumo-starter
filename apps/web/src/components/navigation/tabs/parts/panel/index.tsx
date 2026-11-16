import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useContext, type ComponentProps } from 'react';
import { Transition } from '@/components/display/transition';
import { cn } from '@/lib/utils';
import { TrackContext } from '../context';

export type TabsPanelProps = Omit<ComponentProps<typeof BaseTabs.Panel>, 'className'> & {
	/**
	 * Whether the panel's contents sit in a `Transition`, whose box eases to their size. `false`
	 * opts out of the wrapper altogether, which also drops that.
	 */
	transition?: boolean;
	/** Merged with `cn()`, so a Base UI state callback is not accepted here. */
	className?: string;
};

/**
 * A panel in a `TabsPanels` track: Base UI still owns it — its id, its `aria-labelledby`, `inert` while
 * it is not the selected one — but `hidden` is taken off it, because a panel that is never in the
 * layout cannot be slid out of the way. Instead it stays in its lane, out of sight past the clip,
 * and out of focus by being `inert`.
 */
function TrackPanel({ className, transition = true, value, children, ...props }: TabsPanelProps) {
	return (
		<BaseTabs.Panel
			value={value}
			keepMounted
			render={({ hidden: _hidden, ...panelProps }) => (
				<div
					{...panelProps}
					data-slot="tabs-panel"
					className={cn(
						'min-w-0 text-sm outline-none',
						// Blurred until it is the lane on screen: that is what makes the one arriving read
						// as arriving, coming into focus as it lands. Two filters named, so there is a pair
						// to move between — `inert` is Base UI's word for "not the selected one".
						'transition-[filter] duration-(--duration-state) ease-(--ease-overlay)',
						'[filter:blur(0px)] inert:[filter:blur(var(--blur-inactive))]',
						className,
					)}
				>
					{transition === false ? children : <Transition>{children}</Transition>}
				</div>
			)}
			{...props}
		/>
	);
}

/**
 * A panel whose contents sit in a `Transition`. Content that changes size — a body answered for
 * every tab, a list that gains a line — eases to its new size instead of jumping.
 */
function StackedPanel({ className, transition = true, value, children, ...props }: TabsPanelProps) {
	return (
		<BaseTabs.Panel
			data-slot="tabs-panel"
			value={value}
			// Every panel claims the one cell after the list, so the panel leaving and the panel
			// arriving overlap for the length of the transition instead of stacking end to end.
			className={cn(
				'col-start-1 row-start-2 min-w-0 text-sm',
				'data-[orientation=vertical]:col-start-2 data-[orientation=vertical]:row-start-1',
				'transition-[opacity,translate]',
				'duration-(--duration-overlay) ease-(--ease-overlay)',
				'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:pointer-events-none',
				'data-starting-style:data-[activation-direction=left]:-translate-x-(--shift-content)',
				'data-starting-style:data-[activation-direction=right]:translate-x-(--shift-content)',
				'data-ending-style:data-[activation-direction=left]:translate-x-(--shift-content)',
				'data-ending-style:data-[activation-direction=right]:-translate-x-(--shift-content)',
				className,
			)}
			{...props}
		>
			{transition === false ? children : <Transition>{children}</Transition>}
		</BaseTabs.Panel>
	);
}

/** The panel for the lane it is in: in a track it is slid, stacked it is cross-faded. */
export function TabsPanel(props: TabsPanelProps) {
	const tracked = useContext(TrackContext);
	return tracked ? <TrackPanel {...props} /> : <StackedPanel {...props} />;
}
