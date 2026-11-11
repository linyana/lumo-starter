import { Fragment } from 'react';
import { LumoMenu } from '@/components/ui/menu';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import type { MenuProps } from './types';

export type { MenuItem, MenuProps, MenuSlots } from './types';

/** A menu of actions on a trigger: one list, and the rows it holds. */
export const Menu = ({
	trigger,
	items,
	side = 'bottom',
	align = 'start',
	className,
	classNames,
}: MenuProps) => (
	<LumoMenu.Root>
		<LumoMenu.Trigger render={trigger} />
		<LumoMenu.Portal>
			<LumoMenu.Positioner side={side} align={align} sideOffset={4}>
				<LumoMenu.Popup className={cn(className, classNames?.popup)}>
					<LumoMenu.Viewport className={classNames?.viewport}>
						{(items || []).map((item, index) => (
							<Fragment key={index}>
								{item.separatorBefore && <LumoMenu.Separator className={classNames?.separator} />}
								{item.type === 'content' ? (
									item.content
								) : (
									<LumoMenu.Item
										disabled={item.disabled}
										closeOnClick={item.closeOnClick}
										onClick={item.onClick}
										className={cn(
											classNames?.item,
											item.destructive && 'text-destructive',
											item.className,
										)}
									>
										{item.icon && (
											<span className={cn('mr-2 inline-flex shrink-0 items-center', iconSlot)}>
												{item.icon}
											</span>
										)}
										{item.label}
									</LumoMenu.Item>
								)}
							</Fragment>
						))}
					</LumoMenu.Viewport>
				</LumoMenu.Popup>
			</LumoMenu.Positioner>
		</LumoMenu.Portal>
	</LumoMenu.Root>
);
