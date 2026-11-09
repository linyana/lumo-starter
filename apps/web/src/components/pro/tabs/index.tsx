import { LumoTabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { TabsProps } from './types';

/** One panel at a time, chosen from a row of tabs, with the highlight travelling between them. */
export const Tabs = ({
	items,
	value,
	defaultValue,
	onValueChange,
	variant = 'rounded',
	size = 'md',
	className,
	classNames,
}: TabsProps) => (
	<LumoTabs.Root
		value={value}
		defaultValue={defaultValue ?? items[0]?.value}
		onValueChange={(next) => {
			if (typeof next === 'string') onValueChange?.(next);
		}}
		variant={variant}
		size={size}
		className={cn(className, classNames?.root)}
	>
		<LumoTabs.List className={classNames?.list}>
			<LumoTabs.Indicator className={classNames?.indicator} />
			{items.map((item) => (
				<LumoTabs.Tab
					key={item.value}
					value={item.value}
					disabled={item.disabled}
					className={classNames?.tab}
				>
					{item.icon}
					{item.label}
				</LumoTabs.Tab>
			))}
		</LumoTabs.List>
		{items.map((item) => (
			<LumoTabs.Panel key={item.value} value={item.value} className={classNames?.panel}>
				{item.content}
			</LumoTabs.Panel>
		))}
	</LumoTabs.Root>
);
