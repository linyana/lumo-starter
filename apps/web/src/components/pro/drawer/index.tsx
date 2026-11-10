import { LumoDrawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import type { DrawerParts, DrawerProps } from './types';

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
	'data-slot': dataSlot,
	...props
}: DrawerProps) => {
	// Built once, because both layouts draw the same three pieces: the default one in the order a
	// panel reads in, a render function wherever its own layout wants them.
	const parts: DrawerParts = {
		title: <LumoDrawer.Title className={classNames?.title}>{title}</LumoDrawer.Title>,
		description:
			description === undefined ? null : (
				<LumoDrawer.Description className={classNames?.description}>
					{description}
				</LumoDrawer.Description>
			),
		footer:
			footer === undefined ? null : (
				<div className={cn('mt-auto flex justify-end gap-2 pt-2', classNames?.footer)}>
					{footer}
				</div>
			),
	};

	return (
		<LumoDrawer.Root swipeDirection={side} {...props}>
			<LumoDrawer.Trigger render={trigger} />
			<LumoDrawer.Portal>
				<LumoDrawer.Backdrop className={classNames?.backdrop} />
				<LumoDrawer.Viewport className={classNames?.viewport}>
					<LumoDrawer.Popup
						data-slot={dataSlot ?? 'drawer-popup'}
						className={cn(className, classNames?.popup)}
					>
						{typeof children === 'function' ? (
							children(parts)
						) : (
							<LumoDrawer.Content className={classNames?.content}>
								{parts.title}
								{parts.description}
								{children}
								{parts.footer}
							</LumoDrawer.Content>
						)}
					</LumoDrawer.Popup>
				</LumoDrawer.Viewport>
			</LumoDrawer.Portal>
		</LumoDrawer.Root>
	);
};
