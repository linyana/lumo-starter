import { LumoScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ScrollAreaProps } from './types';

/** A pane that scrolls under the platform's overlay bar, drawn only when there is something to scroll. */
export const ScrollArea = ({
	children,
	height,
	orientation = 'vertical',
	className,
	classNames,
}: ScrollAreaProps) => (
	<LumoScrollArea.Root
		className={cn(className, classNames?.root)}
		style={height === undefined ? undefined : { height }}
	>
		<LumoScrollArea.Viewport className={classNames?.viewport}>
			<LumoScrollArea.Content className={classNames?.content}>{children}</LumoScrollArea.Content>
		</LumoScrollArea.Viewport>
		{orientation !== 'horizontal' && (
			<LumoScrollArea.Scrollbar orientation="vertical" className={classNames?.scrollbar} />
		)}
		{orientation !== 'vertical' && (
			<LumoScrollArea.Scrollbar orientation="horizontal" className={classNames?.scrollbar} />
		)}
	</LumoScrollArea.Root>
);
