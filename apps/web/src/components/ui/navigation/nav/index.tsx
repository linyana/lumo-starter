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
	NavSubGroup,
	NavSubGroupLabel,
	NavSubItem,
} from './parts';
import type { NavEntry, NavItemEntry, NavProps, NavSubEntry } from './types';

export type {
	NavEntry,
	NavGroupEntry,
	NavItemEntry,
	NavProps,
	NavSeparatorEntry,
	NavSkeletonEntry,
	NavSlots,
	NavSubEntry,
	NavSubGroupEntry,
} from '@/components/ui/navigation/nav/types';

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

	const entriesActive = (entries: NavSubEntry[]): boolean =>
		entries.some((entry) =>
			entry.type === 'group'
				? entriesActive(entry.children)
				: isActive({ key: entry.key, explicit: entry.isActive }),
		);

	function renderSubEntry({
		entry,
		index,
		disabled,
	}: {
		entry: NavSubEntry;
		index: number;
		disabled?: boolean;
	}) {
		if (entry.type === 'group') {
			return (
				<NavSubItem key={entry.label ?? `sub-group-${index}`} className={classNames?.subItem}>
					<NavSubGroup className={classNames?.subGroup}>
						{entry.label !== undefined && (
							<NavSubGroupLabel className={classNames?.subGroupLabel}>
								{entry.label}
							</NavSubGroupLabel>
						)}
						{entry.action}
						<ul
							data-slot="nav-sub-group-list"
							className={cn('flex min-w-0 flex-col gap-1', classNames?.subList)}
						>
							{entry.children.map((child, childIndex) =>
								renderSubEntry({ entry: child, index: childIndex, disabled }),
							)}
						</ul>
					</NavSubGroup>
				</NavSubItem>
			);
		}

		return (
			<NavSubItem key={entry.key} className={classNames?.subItem}>
				<NavSubButton
					icon={entry.icon}
					className={cn(classNames?.subButton, entry.className)}
					isActive={isActive({ key: entry.key, explicit: entry.isActive })}
					disabled={disabled || entry.disabled}
					href={entry.href}
					render={entry.render}
					onClick={() => {
						entry.onClick?.();
						onSelect?.(entry.key);
					}}
				>
					{entry.label}
				</NavSubButton>
			</NavSubItem>
		);
	}

	function renderItem(item: NavItemEntry) {
		const active = isActive({ key: item.key, explicit: item.isActive });

		if (item.children !== undefined) {
			return (
				<NavItem key={item.key} className={classNames?.item}>
					<NavSub
						icon={item.icon}
						label={item.label}
						className={cn(classNames?.button, item.className)}
						isActive={active || entriesActive(item.children)}
						defaultOpen={item.defaultOpen}
						disabled={item.disabled}
					>
						{item.children.map((child, index) =>
							renderSubEntry({ entry: child, index, disabled: item.disabled }),
						)}
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
