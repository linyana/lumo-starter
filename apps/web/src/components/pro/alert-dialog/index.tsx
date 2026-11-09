import { LumoAlertDialog } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Button } from '../button';
import type { AlertDialogProps } from './types';

/** A modal that asks rather than offers: the only way out is one of its two buttons. */
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
	<LumoAlertDialog.Root {...props}>
		<LumoAlertDialog.Trigger render={trigger} />
		<LumoAlertDialog.Portal>
			<LumoAlertDialog.Backdrop className={classNames?.backdrop} />
			<LumoAlertDialog.Viewport className={classNames?.viewport}>
				<LumoAlertDialog.Popup className={cn(className, classNames?.popup)}>
					<LumoAlertDialog.Title className={classNames?.title}>{title}</LumoAlertDialog.Title>
					{description !== undefined && (
						<LumoAlertDialog.Description className={classNames?.description}>
							{description}
						</LumoAlertDialog.Description>
					)}
					{children}
					<div className={cn('flex justify-end gap-2', classNames?.actions)}>
						<LumoAlertDialog.Close render={<Button variant="outline">{cancelLabel}</Button>} />
						<LumoAlertDialog.Close
							render={
								<Button variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
									{confirmLabel}
								</Button>
							}
						/>
					</div>
				</LumoAlertDialog.Popup>
			</LumoAlertDialog.Viewport>
		</LumoAlertDialog.Portal>
	</LumoAlertDialog.Root>
);
