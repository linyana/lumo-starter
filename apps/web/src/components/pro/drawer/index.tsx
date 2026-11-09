import { LumoDrawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { DrawerProps } from './types';

/** A panel that slides in from an edge, and can be swiped back out of it. */
export const Drawer = ({
	trigger,
	title,
	description,
	children,
	footer,
	side = 'right',
	className,
	classNames,
	...props
}: DrawerProps) => (
	<LumoDrawer.Root swipeDirection={side} {...props}>
		<LumoDrawer.Trigger render={trigger} />
		<LumoDrawer.Portal>
			<LumoDrawer.Backdrop className={classNames?.backdrop} />
			<LumoDrawer.Viewport className={classNames?.viewport}>
				<LumoDrawer.Popup className={cn(className, classNames?.popup)}>
					<LumoDrawer.Content className={classNames?.content}>
						<LumoDrawer.Title className={classNames?.title}>{title}</LumoDrawer.Title>
						{description !== undefined && (
							<LumoDrawer.Description className={classNames?.description}>
								{description}
							</LumoDrawer.Description>
						)}
						{children}
						{footer !== undefined && (
							<div className={cn('mt-auto flex justify-end gap-2 pt-2', classNames?.footer)}>
								{footer}
							</div>
						)}
					</LumoDrawer.Content>
				</LumoDrawer.Popup>
			</LumoDrawer.Viewport>
		</LumoDrawer.Portal>
	</LumoDrawer.Root>
);
