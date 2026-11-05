import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { SidebarContent, type SidebarProps } from '../sidebar';

export type MobileNavigationProps = Pick<
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
}: MobileNavigationProps) {
	const [open, setOpen] = useState(false);
	const [route, setRoute] = useState([selectedKey, resetScrollKey]);
	const bar = useRef<HTMLDivElement>(null);

	// A new page closes the drawer. Adjusted during render rather than in an effect, so the drawer
	// is already shut when the page it opened is first painted.
	if (route[0] !== selectedKey || route[1] !== resetScrollKey) {
		setRoute([selectedKey, resetScrollKey]);
		setOpen(false);
	}

	useEffect(() => {
		const element = bar.current;
		if (!open || element === null) return;

		// Follow the CSS breakpoint: a hidden bar must not leave a modal drawer active on desktop.
		const observer = new ResizeObserver(() => {
			if (element.getClientRects().length === 0) setOpen(false);
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [open]);

	return (
		<Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="left">
			<div
				ref={bar}
				data-slot="layout-mobile-bar"
				className="flex h-14 shrink-0 items-center gap-2 bg-layout-background px-2 md:hidden"
			>
				<Drawer.Trigger
					render={
						<Button
							data-slot="layout-navigation-trigger"
							variant="ghost"
							size="icon"
							icon={<Menu />}
							aria-label="Open navigation"
						/>
					}
				/>
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
					<div
						data-slot="layout-mobile-actions"
						className="flex shrink-0 items-center gap-1"
					>
						{brandActions}
					</div>
				)}
			</div>
			<Drawer.Portal>
				<Drawer.Backdrop />
				<Drawer.Viewport>
					<Drawer.Popup
						data-slot="layout-mobile-navigation"
						className="bg-layout-background"
					>
						<SidebarContent
							nav={nav}
							selectedKey={selectedKey}
							onSelect={(key) => {
								onSelect?.(key);
								setOpen(false);
							}}
							logo={logo}
							title={
								<Drawer.Title render={<span />} className="text-sm">
									{title ?? 'Navigation'}
								</Drawer.Title>
							}
							brandActions={
								<Drawer.Close
									render={
										<Button
											variant="ghost"
											size="icon"
											icon={<X />}
											aria-label="Close navigation"
										/>
									}
								/>
							}
							toolbar={toolbar}
							footer={footer}
						/>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
