import { cn } from '@/lib/utils';
import {
	DialogBackdrop,
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
		<DialogPortal>
			<DialogBackdrop className={classNames?.backdrop} />
			<DialogViewport className={classNames?.viewport}>
				<DialogPopup className={cn(className, classNames?.popup)}>
					<div className="mb-6">
						<DialogTitle className={classNames?.title}>{title}</DialogTitle>
						{description !== undefined && (
							<DialogDescription className={classNames?.description}>
								{description}
							</DialogDescription>
						)}
					</div>
					{children}
					{footer !== undefined && (
						<div className={cn('flex justify-end gap-2', classNames?.footer)}>{footer}</div>
					)}
				</DialogPopup>
			</DialogViewport>
		</DialogPortal>
	</DialogRoot>
);
