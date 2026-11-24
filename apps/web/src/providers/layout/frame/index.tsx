import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ComponentProps,
	type ReactNode,
} from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';
import { Content } from './content';
import { Header } from './header';
import { MobileNavigation } from './mobile';
import { Sidebar } from './sidebar';
import type { LayoutNavEntry } from './types';

export const layoutVariants = tv({
	slots: {
		root: 'flex h-svh w-full overflow-hidden bg-layout-background',
		main: 'flex min-h-0 min-w-0 flex-1 flex-col',
		surface: 'relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto',
	},
	variants: {
		variant: {
			default: {
				main: 'md:p-2 md:ps-0',
				surface: 'bg-layout-content text-card-foreground md:rounded-xl',
			},
			plain: {
				surface: 'bg-layout-content',
			},
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

type IPropsType = Omit<ComponentProps<'div'>, 'title' | 'onSelect'> & {
	variant?: VariantProps<typeof layoutVariants>['variant'];
	nav?: LayoutNavEntry[];
	selectedKey?: string;
	onSelect?: (key: string) => void;
	logo?: ReactNode;
	title?: ReactNode;
	brandActions?: ReactNode;
	toolbar?: ReactNode;
	footer?: ReactNode;
	collapsible?: boolean;
	defaultCollapsed?: boolean;
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	resetScrollKey?: string;
};

function LayoutRoot({
	variant = 'default',
	nav,
	selectedKey,
	onSelect,
	logo,
	title,
	brandActions,
	toolbar,
	footer,
	collapsible = false,
	defaultCollapsed = false,
	collapsed,
	onCollapsedChange,
	resetScrollKey,
	className,
	children,
	...props
}: IPropsType) {
	const { root, main, surface } = layoutVariants({ variant });
	const [uncontrolled, setUncontrolled] = useState(defaultCollapsed);
	const isCollapsed = collapsed ?? uncontrolled;
	const surfaceRef = useRef<HTMLElement>(null);
	const shownKey = useRef(resetScrollKey);

	useLayoutEffect(() => {
		if (shownKey.current === resetScrollKey) return;
		shownKey.current = resetScrollKey;
		surfaceRef.current?.scrollTo({ top: 0, behavior: 'instant' });
	}, [resetScrollKey]);

	const toggle = useCallback(() => {
		const next = !isCollapsed;
		setUncontrolled(next);
		onCollapsedChange?.(next);
	}, [isCollapsed, onCollapsedChange]);

	useEffect(() => {
		if (!collapsible) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'b' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				toggle();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [collapsible, toggle]);

	return (
		<div
			data-slot="layout"
			data-variant={variant}
			data-collapsed={isCollapsed ? '' : undefined}
			className={cn(root(), className)}
			{...props}
		>
			<Sidebar
				nav={nav}
				selectedKey={selectedKey}
				onSelect={onSelect}
				logo={logo}
				title={title}
				brandActions={brandActions}
				toolbar={toolbar}
				footer={footer}
				collapsible={collapsible}
				collapsed={isCollapsed}
				onToggle={toggle}
			/>
			<div data-slot="layout-main" className={main()}>
				{nav !== undefined && (
					<MobileNavigation
						nav={nav}
						selectedKey={selectedKey}
						onSelect={onSelect}
						logo={logo}
						title={title}
						brandActions={brandActions}
						toolbar={toolbar}
						footer={footer}
						resetScrollKey={resetScrollKey}
					/>
				)}
				<main ref={surfaceRef} data-slot="layout-surface" className={surface()}>
					{children}
				</main>
			</div>
		</div>
	);
}

export const Layout = Object.assign(LayoutRoot, { Header, Content });

export type {
	LayoutNavEntry,
	LayoutNavGroup,
	LayoutNavItem,
	LayoutNavSeparator,
	LayoutNavSkeleton,
	LayoutNavSubEntry,
	LayoutNavSubGroup,
} from './types';
export type { SidebarProps } from './sidebar';
