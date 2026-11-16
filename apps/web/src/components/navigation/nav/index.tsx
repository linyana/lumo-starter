import { cn } from '@/lib/utils';
import {
	NavBadge,
	NavButton,
	NavGroup,
	NavGroupLabel,
	NavItem,
	NavList,
	NavRoot,
	NavSeparator,
	NavSkeleton,
	NavSub,
	NavSubButton,
	NavSubItem,
} from './parts';
import type { NavEntry, NavItemEntry, NavProps } from './types';

export type {
	NavEntry,
	NavGroupEntry,
	NavItemEntry,
	NavProps,
	NavSeparatorEntry,
	NavSkeletonEntry,
	NavSlots,
} from '@/components/navigation/nav/types';

/** Navigation rows, groups and submenus share the same compact rail context. */
export const Nav = ({
	items,
	children,
	selectedKey,
	onSelect,
	compact = false,
	className,
	classNames,
}: NavProps) => {
	const isActive = ({ key, explicit }: { key: string; explicit?: boolean }) =>
		explicit ?? key === selectedKey;

	function renderItem(item: NavItemEntry) {
		const active = isActive({ key: item.key, explicit: item.isActive });

		if (item.children !== undefined) {
			return (
				<NavItem key={item.key} className={classNames?.item}>
					<NavSub
						icon={item.icon}
						label={item.label}
						className={cn(classNames?.button, item.className)}
						isActive={
							active ||
							item.children.some((child) => isActive({ key: child.key, explicit: child.isActive }))
						}
						defaultOpen={item.defaultOpen}
						disabled={item.disabled}
					>
						{item.children.map((child) => (
							<NavSubItem key={child.key}>
								<NavSubButton
									icon={child.icon}
									className={cn(classNames?.subButton, child.className)}
									isActive={isActive({ key: child.key, explicit: child.isActive })}
									disabled={item.disabled || child.disabled}
									href={child.href}
									render={child.render}
									onClick={() => {
										child.onClick?.();
										onSelect?.(child.key);
									}}
								>
									{child.label}
								</NavSubButton>
							</NavSubItem>
						))}
					</NavSub>
				</NavItem>
			);
		}

		return (
			<NavItem key={item.key} className={classNames?.item}>
				<NavButton
					icon={item.icon}
					label={item.label}
					className={cn(classNames?.button, item.className)}
					isActive={active}
					disabled={item.disabled}
					href={item.href}
					render={item.render}
					onClick={() => {
						item.onClick?.();
						onSelect?.(item.key);
					}}
				/>
				{item.badge !== undefined && (
					<NavBadge className={classNames?.badge}>{item.badge}</NavBadge>
				)}
			</NavItem>
		);
	}

	function renderEntry({ entry, index }: { entry: NavEntry; index?: number }) {
		if (entry.type === 'separator') return <NavSeparator key={`separator-${index}`} />;

		if (entry.type === 'skeleton') {
			return (
				<NavSkeleton key={`skeleton-${index}`} showIcon={entry.showIcon} width={entry.width} />
			);
		}

		if (entry.type === 'group') {
			return (
				<NavGroup key={entry.label ?? `group-${index}`} className={classNames?.group}>
					{entry.label !== undefined && (
						<NavGroupLabel className={classNames?.groupLabel}>{entry.label}</NavGroupLabel>
					)}
					{entry.action}
					<NavList className={classNames?.list}>
						{entry.children.map((child, childIndex) =>
							renderEntry({ entry: child, index: childIndex }),
						)}
					</NavList>
				</NavGroup>
			);
		}

		return renderItem(entry);
	}

	/**
	 * Groups are padded; a loose row is not, so a row typed straight into the array would sit
	 * against the rail's edge while its neighbours sit 8px in. Everything outside a group is
	 * wrapped in one, and an unbroken run of them shares a single group instead of gaining a
	 * gap per row.
	 */
	function renderEntries(entries: NavEntry[]) {
		const blocks = entries.reduce<(NavEntry | NavEntry[])[]>((acc, entry) => {
			if (entry.type === 'group' || entry.type === 'separator') return [...acc, entry];

			const last = acc[acc.length - 1];
			return Array.isArray(last) ? [...acc.slice(0, -1), [...last, entry]] : [...acc, [entry]];
		}, []);

		return blocks.map((block, index) =>
			Array.isArray(block) ? (
				<NavGroup
					className={classNames?.group}
					key={`loose-${block.map((entry) => ('key' in entry ? entry.key : entry.type)).join('-')}`}
				>
					<NavList className={classNames?.list}>
						{block.map((entry) => renderEntry({ entry }))}
					</NavList>
				</NavGroup>
			) : (
				renderEntry({ entry: block, index })
			),
		);
	}

	return (
		<NavRoot compact={compact} className={cn(className, classNames?.root)}>
			{items !== undefined && renderEntries(items)}
			{children}
		</NavRoot>
	);
};
