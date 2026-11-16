import { cn } from '@/lib/utils';
import { TabsIndicator, TabsList, TabsPanel, TabsRoot, TabsTab } from './parts';
import type { TabsProps } from './types';

/** One panel at a time, chosen from a row of tabs, with the highlight travelling between them. */
export const Tabs = ({
	items,
	value,
	defaultValue,
	onChange,
	variant = 'rounded',
	size = 'md',
	className,
	classNames,
}: TabsProps) => (
	<TabsRoot
		value={value}
		defaultValue={defaultValue ?? items[0]?.value}
		onValueChange={(next) => {
			if (typeof next === 'string') onChange?.(next);
		}}
		variant={variant}
		size={size}
		className={cn(className, classNames?.root)}
	>
		<TabsList className={classNames?.list}>
			<TabsIndicator className={classNames?.indicator} />
			{items.map((item) => (
				<TabsTab
					key={item.value}
					value={item.value}
					disabled={item.disabled}
					className={classNames?.tab}
				>
					{item.icon}
					{item.label}
				</TabsTab>
			))}
		</TabsList>
		{items.map((item) => (
			<TabsPanel key={item.value} value={item.value} className={classNames?.panel}>
				{item.content}
			</TabsPanel>
		))}
	</TabsRoot>
);
