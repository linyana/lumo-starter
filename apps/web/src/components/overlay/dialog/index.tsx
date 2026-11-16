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

/** A modal: a title, a body, and a footer, with the page behind it inert. */
export const Dialog = ({
	trigger,
	title,
	description,
	children,
	footer,
	className,
	classNames,
	...props
}: DialogProps) => (
	<DialogRoot {...props}>
		{trigger !== undefined && <DialogTrigger render={trigger} />}
		<DialogPortal>
			<DialogBackdrop className={classNames?.backdrop} />
			<DialogViewport className={classNames?.viewport}>
				<DialogPopup className={cn(className, classNames?.popup)}>
					<DialogTitle className={classNames?.title}>{title}</DialogTitle>
					{description !== undefined && (
						<DialogDescription className={classNames?.description}>{description}</DialogDescription>
					)}
					{children}
					{footer !== undefined && (
						<div className={cn('flex justify-end gap-2', classNames?.footer)}>{footer}</div>
					)}
				</DialogPopup>
			</DialogViewport>
		</DialogPortal>
	</DialogRoot>
);
