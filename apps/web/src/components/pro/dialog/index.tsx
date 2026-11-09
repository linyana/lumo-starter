import { LumoDialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
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
	<LumoDialog.Root {...props}>
		<LumoDialog.Trigger render={trigger} />
		<LumoDialog.Portal>
			<LumoDialog.Backdrop className={classNames?.backdrop} />
			<LumoDialog.Viewport className={classNames?.viewport}>
				<LumoDialog.Popup className={cn(className, classNames?.popup)}>
					<LumoDialog.Title className={classNames?.title}>{title}</LumoDialog.Title>
					{description !== undefined && (
						<LumoDialog.Description className={classNames?.description}>
							{description}
						</LumoDialog.Description>
					)}
					{children}
					{footer !== undefined && (
						<div className={cn('flex justify-end gap-2', classNames?.footer)}>{footer}</div>
					)}
				</LumoDialog.Popup>
			</LumoDialog.Viewport>
		</LumoDialog.Portal>
	</LumoDialog.Root>
);
