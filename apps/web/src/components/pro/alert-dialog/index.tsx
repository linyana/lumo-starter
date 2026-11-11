import { type ComponentProps, useRef } from 'react';
import { LumoAlertDialog } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Button } from '../button';
import type { AlertDialogProps } from './types';

/** What Base UI's `actionsRef` exposes: closing from a part that is not a `Close`. */
type Actions = NonNullable<ComponentProps<typeof LumoAlertDialog.Root>['actionsRef']>['current'];

/**
 * A modal that asks rather than offers: answered by one of its two buttons, or by a click away from
 * the panel. Base UI closes an alert dialog on neither, so the outside click is ours — the viewport
 * is the layer the panel is centred in, so a click that lands on the viewport itself rather than on
 * anything drawn inside the panel is the click outside.
 */
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
}: AlertDialogProps) => {
	const actions = useRef<Actions>(null);

	return (
		<LumoAlertDialog.Root actionsRef={actions} {...props}>
			<LumoAlertDialog.Trigger render={trigger} />
			<LumoAlertDialog.Portal>
				<LumoAlertDialog.Backdrop className={classNames?.backdrop} />
				<LumoAlertDialog.Viewport
					className={classNames?.viewport}
					onClick={(event) => {
						if (event.target === event.currentTarget) actions.current?.close();
					}}
				>
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
									<Button tone={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
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
};
