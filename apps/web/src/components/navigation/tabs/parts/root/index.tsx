import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { useCallback, useMemo, useState, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { ActiveContext, TabsContext, TrackContext } from '../context';
import type { TabsValue } from '../panels';

export type TabsVariant = 'rounded' | 'pill' | 'square' | 'point';

export type TabsSize = 'sm' | 'md' | 'lg';

export type TabsRootProps = ComponentProps<typeof BaseTabs.Root> & {
	variant?: TabsVariant;
	size?: TabsSize;
};

/**
 * Base UI owns the value. It is mirrored here because a part that is not a Base UI part — the
 * track that has to know how many lanes to the left the selected one is — has to read it too, and
 * it is handed out through a context of its own so that a click on a tab does not re-render the
 * look every tab already agreed on.
 */
export function TabsRoot({
	className,
	variant = 'rounded',
	size = 'md',
	value,
	defaultValue,
	onValueChange,
	children,
	...props
}: TabsRootProps) {
	const [selected, setSelected] = useState<TabsValue>(() => defaultValue);

	const handleValueChange = useCallback(
		(next: TabsValue, details: Parameters<NonNullable<TabsRootProps['onValueChange']>>[1]) => {
			onValueChange?.(next, details);
			if (details.reason === 'none' && details.isCanceled) return;
			setSelected(() => next);
		},
		[onValueChange],
	);

	const activeValue = value !== undefined ? value : selected;
	const context = useMemo(() => ({ variant, size }), [variant, size]);

	return (
		<TabsContext.Provider value={context}>
			<ActiveContext.Provider value={activeValue}>
				<BaseTabs.Root
					data-slot="tabs"
					data-variant={variant}
					data-size={size}
					value={value}
					defaultValue={defaultValue}
					onValueChange={handleValueChange}
					className={cn(
						'grid grid-cols-1 gap-4',
						'data-[orientation=vertical]:grid-cols-[auto_1fr] data-[orientation=vertical]:items-start',
						className,
					)}
					{...props}
				>
					<TrackContext.Provider value={false}>{children}</TrackContext.Provider>
				</BaseTabs.Root>
			</ActiveContext.Provider>
		</TabsContext.Provider>
	);
}
