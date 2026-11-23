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

export const Drawer = ({
	trigger,
	title,
	description,
	children,
	footer,
	side = 'right',
	container,
	keepMounted,
	portalProps,
	backdropProps,
	viewportProps,
	className,
	classNames,
	'data-slot': dataSlot,
	...props
}: DrawerProps) => {
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
			<DrawerPortal container={container} keepMounted={keepMounted} {...portalProps}>
				<DrawerBackdrop
					{...backdropProps}
					className={cn(classNames?.backdrop, backdropProps?.className)}
				/>
				<DrawerViewport
					{...viewportProps}
					className={cn(classNames?.viewport, viewportProps?.className)}
				>
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
