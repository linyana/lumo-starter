import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useContext, type ComponentProps } from 'react';
import { Transition } from '@/components/display/transition';
import { cn } from '@/lib/utils';
import { TrackContext } from '../context';

export type TabsPanelProps = Omit<ComponentProps<typeof BaseTabs.Panel>, 'className'> & {
	transition?: boolean;
	className?: string;
};

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

function StackedPanel({ className, transition = true, value, children, ...props }: TabsPanelProps) {
	return (
		<BaseTabs.Panel
			data-slot="tabs-panel"
			value={value}
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

export function TabsPanel(props: TabsPanelProps) {
	const tracked = useContext(TrackContext);
	return tracked ? <TrackPanel {...props} /> : <StackedPanel {...props} />;
}
