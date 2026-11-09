import { Fragment } from 'react';
import { LumoMenu } from '@/components/ui/menu';
import { cn } from '@/lib/utils';
import type { MenuProps } from './types';

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
			<LumoMenu.Positioner side={side} align={align}>
				<LumoMenu.Popup className={cn(className, classNames?.popup)}>
					<LumoMenu.Viewport className={classNames?.viewport}>
						{items.map((item, index) => (
							<Fragment key={index}>
								{item.separatorBefore && <LumoMenu.Separator className={classNames?.separator} />}
								<LumoMenu.Item
									disabled={item.disabled}
									onClick={item.onClick}
									className={cn(
										classNames?.item,
										item.destructive && 'text-destructive',
										item.className,
									)}
								>
									{item.icon}
									{item.label}
								</LumoMenu.Item>
							</Fragment>
						))}
					</LumoMenu.Viewport>
				</LumoMenu.Popup>
			</LumoMenu.Positioner>
		</LumoMenu.Portal>
	</LumoMenu.Root>
);
