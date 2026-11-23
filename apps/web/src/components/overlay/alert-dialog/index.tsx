import { Button } from '@/components/form/button';
import { modalBody, modalContent, modalHeader } from '@/lib/surface';
import { cn } from '@/lib/utils';
import {
	AlertDialogBackdrop,
	AlertDialogClose,
	AlertDialogDescription,
	AlertDialogPopup,
	AlertDialogPortal,
	AlertDialogRoot,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogViewport,
} from './parts';
import type { AlertDialogProps } from './types';

export const AlertDialog = ({
	trigger,
	title,
	description,
	children,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	destructive = false,
	confirmCloses = true,
	pending = false,
	backdrop = true,
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
}: AlertDialogProps) => {
	const confirm = (
		<Button
			tone={destructive ? 'destructive' : 'default'}
			loading={pending}
			disabled={pending}
			onClick={onConfirm}
		>
			{confirmLabel}
		</Button>
	);

	return (
		<AlertDialogRoot
			{...props}
			onOpenChangeComplete={(next) => {
				onOpenChangeComplete?.(next);
				if (!next) onClosed?.();
			}}
		>
			{trigger !== undefined && <AlertDialogTrigger render={trigger} />}
			<AlertDialogPortal container={container} keepMounted={keepMounted} {...portalProps}>
				{backdrop && (
					<AlertDialogBackdrop
						{...backdropProps}
						className={cn(classNames?.backdrop, backdropProps?.className)}
					/>
				)}
				<AlertDialogViewport
					{...viewportProps}
					className={cn(classNames?.viewport, viewportProps?.className)}
				>
					<AlertDialogPopup className={cn('max-w-sm', className, classNames?.popup)}>
						<div data-slot="alert-dialog-content" className={cn(modalContent, classNames?.content)}>
							<div data-slot="alert-dialog-header" className={cn(modalHeader, classNames?.header)}>
								<AlertDialogTitle className={classNames?.title}>{title}</AlertDialogTitle>
								{description !== undefined && (
									<AlertDialogDescription className={classNames?.description}>
										{description}
									</AlertDialogDescription>
								)}
							</div>
							{children !== undefined && (
								<div data-slot="alert-dialog-body" className={cn(modalBody, classNames?.body)}>
									{children}
								</div>
							)}
							<div
								data-slot="alert-dialog-actions"
								className={cn('grid shrink-0 grid-cols-2 gap-2', classNames?.actions)}
							>
								<AlertDialogClose
									render={
										<Button variant="outline" disabled={pending}>
											{cancelLabel}
										</Button>
									}
								/>
								{confirmCloses ? <AlertDialogClose render={confirm} /> : confirm}
							</div>
						</div>
					</AlertDialogPopup>
				</AlertDialogViewport>
			</AlertDialogPortal>
		</AlertDialogRoot>
	);
};
