import { Fragment } from 'react';
import { filterAccess } from '@lumo/shared';
import { LumoMenu } from '@/components/ui/menu';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { useAccess } from '../access';
import type { SlotClassNames } from '../types';
import type { MenuItem, MenuProps, MenuSlots } from './types';

export type { MenuItem, MenuProps, MenuSlots } from './types';

/** The rows a list of actions is drawn from: one line each, a separator where it was asked for. */
type MenuItemsProps = {
	items: MenuItem[];
	classNames?: SlotClassNames<MenuSlots>;
};

/**
 * The rows themselves, drawn from data, and only those the surrounding grant allows — a caller states
 * `access` on a row and never asks who is reading. A separator that was only there to set a stripped
 * row apart goes with it: the first row never draws one.
 *
 * It is one implementation for two openings — a menu behind a trigger and a menu opened where the
 * pointer was pressed — because a reader should not be able to tell the two apart once they are open,
 * and the conditions they are drawn under are the same ones.
 */
export const MenuItems = ({ items, classNames }: MenuItemsProps) => {
	const grant = useAccess();

	return (
		<>
			{filterAccess({ items, grant }).map((item, index) => (
				<Fragment key={index}>
					{item.separatorBefore && index > 0 && (
						<LumoMenu.Separator className={classNames?.separator} />
					)}
					{item.type === 'content' ? (
						item.content
					) : (
						<LumoMenu.Item
							disabled={item.disabled}
							closeOnClick={item.closeOnClick}
							onClick={item.onClick}
							tone={item.destructive ? 'destructive' : 'default'}
							className={cn(classNames?.item, item.className)}
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
		</>
	);
};

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
						<MenuItems items={items} classNames={classNames} />
					</LumoMenu.Viewport>
				</LumoMenu.Popup>
			</LumoMenu.Positioner>
		</LumoMenu.Portal>
	</LumoMenu.Root>
);
