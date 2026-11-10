import { LumoNav } from '@/components/ui/nav';
import { cn } from '@/lib/utils';
import type { NavEntry, NavItem, NavProps } from './types';

export type {
	NavEntry,
	NavGroup,
	NavItem,
	NavProps,
	NavSeparator,
	NavSkeleton,
	NavSlots,
} from './types';

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
	const isActive = (key: string, explicit?: boolean) => explicit ?? key === selectedKey;

	function renderItem(item: NavItem) {
		const active = isActive(item.key, item.isActive);

		if (item.children !== undefined) {
			return (
				<LumoNav.Item key={item.key} className={classNames?.item}>
					<LumoNav.Sub
						icon={item.icon}
						label={item.label}
						className={cn(classNames?.button, item.className)}
						isActive={active || item.children.some((child) => isActive(child.key, child.isActive))}
						defaultOpen={item.defaultOpen}
						disabled={item.disabled}
					>
						{item.children.map((child) => (
							<LumoNav.SubItem key={child.key}>
								<LumoNav.SubButton
									icon={child.icon}
									className={cn(classNames?.subButton, child.className)}
									isActive={isActive(child.key, child.isActive)}
									disabled={item.disabled || child.disabled}
									href={child.href}
									render={child.render}
									onClick={() => {
										child.onClick?.();
										onSelect?.(child.key);
									}}
								>
									{child.label}
								</LumoNav.SubButton>
							</LumoNav.SubItem>
						))}
					</LumoNav.Sub>
				</LumoNav.Item>
			);
		}

		return (
			<LumoNav.Item key={item.key} className={classNames?.item}>
				<LumoNav.Button
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
					<LumoNav.Badge className={classNames?.badge}>{item.badge}</LumoNav.Badge>
				)}
			</LumoNav.Item>
		);
	}

	function renderEntry(entry: NavEntry, index: number) {
		if (entry.type === 'separator') return <LumoNav.Separator key={`separator-${index}`} />;

		if (entry.type === 'skeleton') {
			return (
				<LumoNav.Skeleton key={`skeleton-${index}`} showIcon={entry.showIcon} width={entry.width} />
			);
		}

		if (entry.type === 'group') {
			return (
				<LumoNav.Group key={entry.label ?? `group-${index}`} className={classNames?.group}>
					{entry.label !== undefined && (
						<LumoNav.GroupLabel className={classNames?.groupLabel}>
							{entry.label}
						</LumoNav.GroupLabel>
					)}
					{entry.action}
					<LumoNav.List className={classNames?.list}>
						{entry.children.map((child, childIndex) => renderEntry(child, childIndex))}
					</LumoNav.List>
				</LumoNav.Group>
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
				<LumoNav.Group
					className={classNames?.group}
					key={`loose-${block.map((entry) => ('key' in entry ? entry.key : entry.type)).join('-')}`}
				>
					<LumoNav.List className={classNames?.list}>{block.map(renderEntry)}</LumoNav.List>
				</LumoNav.Group>
			) : (
				renderEntry(block, index)
			),
		);
	}

	return (
		<LumoNav.Root compact={compact} className={cn(className, classNames?.root)}>
			{items !== undefined && renderEntries(items)}
			{children}
		</LumoNav.Root>
	);
};
