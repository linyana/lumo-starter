import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, Drawer } from '@/components';
import { SidebarContent, type SidebarProps } from '../sidebar';

type IPropsType = Pick<
	SidebarProps,
	'nav' | 'selectedKey' | 'onSelect' | 'logo' | 'title' | 'brandActions' | 'toolbar' | 'footer'
> & {
	resetScrollKey?: string;
};

export function MobileNavigation({
	nav,
	selectedKey,
	onSelect,
	logo,
	title,
	brandActions,
	toolbar,
	footer,
	resetScrollKey,
}: IPropsType) {
	const [open, setOpen] = useState(false);
	const [route, setRoute] = useState([selectedKey, resetScrollKey]);
	const bar = useRef<HTMLDivElement>(null);

	if (route[0] !== selectedKey || route[1] !== resetScrollKey) {
		setRoute([selectedKey, resetScrollKey]);
		setOpen(false);
	}

	useEffect(() => {
		const element = bar.current;
		if (!open || element === null) return;

		const observer = new ResizeObserver(() => {
			if (element.getClientRects().length === 0) setOpen(false);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [open]);

	return (
		<div
			ref={bar}
			data-slot="layout-mobile-bar"
			className="flex h-14 shrink-0 items-center gap-2 bg-layout-background px-2 md:hidden"
		>
			<Drawer
				open={open}
				onOpenChange={setOpen}
				side="left"
				title={title ?? 'Navigation'}
				data-slot="layout-mobile-navigation"
				className="bg-layout-background"
				classNames={{ title: 'truncate text-sm' }}
				trigger={
					<Button
						data-slot="layout-navigation-trigger"
						variant="ghost"
						size="icon-sm"
						icon={<Menu />}
						aria-label="Open navigation"
					/>
				}
			>
				{({ title: drawerTitle }) => (
					<SidebarContent
						nav={nav}
						selectedKey={selectedKey}
						onSelect={(key) => {
							onSelect?.(key);
							setOpen(false);
						}}
						logo={logo}
						title={drawerTitle}
						brandActions={
							<Button
								variant="ghost"
								size="icon-sm"
								icon={<X />}
								aria-label="Close navigation"
								onClick={() => setOpen(false)}
							/>
						}
						toolbar={toolbar}
						footer={footer}
					/>
				)}
			</Drawer>
			<div
				data-slot="layout-mobile-brand"
				className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold"
			>
				{logo}
				{title !== undefined && (
					<span data-slot="layout-mobile-title" className="truncate">
						{title}
					</span>
				)}
			</div>
			{brandActions !== undefined && (
				<div data-slot="layout-mobile-actions" className="flex shrink-0 items-center gap-1">
					{brandActions}
				</div>
			)}
		</div>
	);
}
