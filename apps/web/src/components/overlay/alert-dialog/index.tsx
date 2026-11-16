import { useRef, type ComponentProps } from 'react';
import { FillIcon } from '@/components/display/icons';
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

/** What Base UI's `actionsRef` exposes: closing from a part that is not a `Close`. */
type Actions = NonNullable<ComponentProps<typeof AlertDialogRoot>['actionsRef']>['current'];

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
		<AlertDialogRoot actionsRef={actions} {...props}>
			{trigger !== undefined && <AlertDialogTrigger render={trigger} />}
			<AlertDialogPortal>
				<AlertDialogBackdrop className={classNames?.backdrop} />
				<AlertDialogViewport
					className={classNames?.viewport}
					onClick={(event) => {
						if (event.target === event.currentTarget) actions.current?.close();
					}}
				>
					<AlertDialogPopup
						className={cn(className, classNames?.popup, 'flex flex-col items-center gap-2')}
					>
						<FillIcon
							name="circle-exclamation"
							className="size-10 text-destructive"
							aria-hidden={false}
							aria-label="Failed"
						/>
						<div>
							<AlertDialogTitle className={cn(classNames?.title, 'text-center')}>
								{title}
							</AlertDialogTitle>
							{description !== undefined && (
								<AlertDialogDescription className={cn(classNames?.description, 'text-center')}>
									{description}
								</AlertDialogDescription>
							)}
						</div>
						{children}
						<div className={cn('grid w-full grid-cols-2 gap-4 mt-4', classNames?.actions)}>
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
};
