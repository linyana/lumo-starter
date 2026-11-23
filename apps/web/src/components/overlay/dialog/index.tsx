import { X } from 'lucide-react';
import { Button } from '@/components/form/button';
import { modalBody, modalContent, modalFooter, modalHeader } from '@/lib/surface';
import { cn } from '@/lib/utils';
import {
	DialogBackdrop,
	DialogClose,
	DialogDescription,
	DialogPopup,
	DialogPortal,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
	DialogViewport,
} from './parts';
import type { DialogProps } from './types';

export const Dialog = ({
	trigger,
	title,
	description,
	children,
	footer,
	backdrop = true,
	closeButton = true,
	closeLabel = 'Close',
	container,
	keepMounted,
	portalProps,
	backdropProps,
	viewportProps,
	className,
	classNames,
	onOpenChangeComplete,
	onClosed,
	...props
}: DialogProps) => (
	<DialogRoot
		{...props}
		onOpenChangeComplete={(next) => {
			onOpenChangeComplete?.(next);
			if (!next) onClosed?.();
		}}
	>
		{trigger !== undefined && <DialogTrigger render={trigger} />}
		<DialogPortal container={container} keepMounted={keepMounted} {...portalProps}>
			{backdrop && (
				<DialogBackdrop
					{...backdropProps}
					className={cn(classNames?.backdrop, backdropProps?.className)}
				/>
			)}
			<DialogViewport
				{...viewportProps}
				className={cn(classNames?.viewport, viewportProps?.className)}
			>
				<DialogPopup className={cn(className, classNames?.popup)}>
					<div data-slot="dialog-content" className={cn(modalContent, classNames?.content)}>
						<div
							data-slot="dialog-header"
							className={cn(modalHeader, closeButton && 'pr-5', classNames?.header)}
						>
							<DialogTitle className={classNames?.title}>{title}</DialogTitle>
							{description !== undefined && (
								<DialogDescription className={classNames?.description}>
									{description}
								</DialogDescription>
							)}
						</div>
						{children !== undefined && (
							<div data-slot="dialog-body" className={cn(modalBody, classNames?.body)}>
								{children}
							</div>
						)}
						{footer !== undefined && (
							<div data-slot="dialog-footer" className={cn(modalFooter, classNames?.footer)}>
								{footer}
							</div>
						)}
					</div>
					{closeButton && (
						<DialogClose
							render={
								<Button
									variant="ghost"
									size="icon"
									icon={<X />}
									aria-label={closeLabel}
									className={cn('absolute top-3 right-3', classNames?.close)}
								/>
							}
						/>
					)}
				</DialogPopup>
			</DialogViewport>
		</DialogPortal>
	</DialogRoot>
);
