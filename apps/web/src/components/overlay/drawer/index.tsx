import { cn } from '@/lib/utils';
import {
	DrawerBackdrop,
	DrawerContent,
	DrawerDescription,
	DrawerPopup,
	DrawerPortal,
	DrawerRoot,
	DrawerTitle,
	DrawerTrigger,
	DrawerViewport,
} from './parts';
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
		title: <DrawerTitle className={classNames?.title}>{title}</DrawerTitle>,
		description:
			description === undefined ? null : (
				<DrawerDescription className={classNames?.description}>{description}</DrawerDescription>
			),
		footer:
			footer === undefined ? null : (
				<div className={cn('mt-auto flex justify-end gap-2 pt-2', classNames?.footer)}>
					{footer}
				</div>
			),
	};

	return (
		<DrawerRoot swipeDirection={side} {...props}>
			<DrawerTrigger render={trigger} />
			<DrawerPortal>
				<DrawerBackdrop className={classNames?.backdrop} />
				<DrawerViewport className={classNames?.viewport}>
					<DrawerPopup
						data-slot={dataSlot ?? 'drawer-popup'}
						className={cn(className, classNames?.popup)}
					>
						{typeof children === 'function' ? (
							children(parts)
						) : (
							<DrawerContent className={classNames?.content}>
								{parts.title}
								{parts.description}
								{children}
								{parts.footer}
							</DrawerContent>
						)}
					</DrawerPopup>
				</DrawerViewport>
			</DrawerPortal>
		</DrawerRoot>
	);
};
