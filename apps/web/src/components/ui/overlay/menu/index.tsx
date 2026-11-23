import { filterAccess } from '@lumo/shared';
import { Fragment } from 'react';
import type { SlotClassNames } from '@/components/types';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { useAccess } from '@/providers/access';
import {
	MenuItem,
	MenuPopup,
	MenuPortal,
	MenuPositioner,
	MenuRoot,
	MenuSeparator,
	MenuTrigger,
	MenuViewport,
} from './parts';
import type { MenuEntry, MenuProps, MenuSlots } from './types';

export type { MenuEntry, MenuProps, MenuSlots } from '@/components/ui/overlay/menu/types';

type MenuItemsProps = {
	items: MenuEntry[];
	classNames?: SlotClassNames<MenuSlots>;
};

export const MenuItems = ({ items, classNames }: MenuItemsProps) => {
	const grant = useAccess();

	return (
		<>
			{filterAccess({ items, grant }).map((item, index) => (
				<Fragment key={index}>
					{item.separatorBefore && index > 0 && <MenuSeparator className={classNames?.separator} />}
					{item.type === 'content' ? (
						item.content
					) : (
						<MenuItem
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
						</MenuItem>
					)}
				</Fragment>
			))}
		</>
	);
};

export const Menu = ({
	trigger,
	items,
	side = 'bottom',
	align = 'start',
	className,
	classNames,
}: MenuProps) => (
	<MenuRoot>
		<MenuTrigger render={trigger} />
		<MenuPortal>
			<MenuPositioner side={side} align={align} sideOffset={4}>
				<MenuPopup className={cn(className, classNames?.popup)}>
					<MenuViewport className={classNames?.viewport}>
						<MenuItems items={items} classNames={classNames} />
					</MenuViewport>
				</MenuPopup>
			</MenuPositioner>
		</MenuPortal>
	</MenuRoot>
);
