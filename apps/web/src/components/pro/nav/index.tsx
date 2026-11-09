import { LumoNav } from '@/components/ui/nav';
import { cn } from '@/lib/utils';
import type { NavProps } from './types';

/** A list of navigation rows: glyph, label, the page you are on, and where each row goes. */
export const Nav = ({ items, compact = false, className, classNames }: NavProps) => (
	<LumoNav.Root compact={compact} className={cn(className, classNames?.root)}>
		<LumoNav.List className={classNames?.list}>
			{items.map((item) => (
				<LumoNav.Item key={item.key} className={classNames?.item}>
					<LumoNav.Button
						icon={item.icon}
						label={item.label}
						href={item.href}
						isActive={item.isActive}
						disabled={item.disabled}
						onClick={item.onClick}
						className={cn(classNames?.button, item.className)}
					>
						{item.badge !== undefined && (
							<LumoNav.Badge className={classNames?.badge}>{item.badge}</LumoNav.Badge>
						)}
					</LumoNav.Button>
				</LumoNav.Item>
			))}
		</LumoNav.List>
	</LumoNav.Root>
);
