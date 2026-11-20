import { Button } from '@/components/form/button';
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
	className,
	classNames,
	...props
}: AlertDialogProps) => (
	<AlertDialogRoot {...props}>
		{trigger !== undefined && <AlertDialogTrigger render={trigger} />}
		<AlertDialogPortal>
			<AlertDialogBackdrop className={classNames?.backdrop} />
			<AlertDialogViewport className={classNames?.viewport}>
				<AlertDialogPopup
					className={cn(className, classNames?.popup, 'flex flex-col items-center gap-2')}
				>
					<div>
						<AlertDialogTitle className={classNames?.title}>{title}</AlertDialogTitle>
						{description !== undefined && (
							<AlertDialogDescription className={classNames?.description}>
								{description}
							</AlertDialogDescription>
						)}
					</div>
					{children}
					<div className={cn('grid w-full grid-cols-2 gap-2 mt-3', classNames?.actions)}>
						<AlertDialogClose render={<Button variant="outline">{cancelLabel}</Button>} />
						<AlertDialogClose
							render={
								<Button tone={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
									{confirmLabel}
								</Button>
							}
						/>
					</div>
				</AlertDialogPopup>
			</AlertDialogViewport>
		</AlertDialogPortal>
	</AlertDialogRoot>
);
