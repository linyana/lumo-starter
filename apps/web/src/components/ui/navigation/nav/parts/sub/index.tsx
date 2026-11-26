import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { useState, type ReactNode } from 'react';
import {
	CollapsibleIcon,
	CollapsiblePanel,
	CollapsibleRoot,
} from '@/components/ui/display/collapsible/parts';
import {
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverRoot,
	PopoverTitle,
	PopoverTrigger,
} from '@/components/ui/overlay/popover/parts';
import { cn } from '@/lib/utils';
import { NavButton } from '../button';
import { useNav } from '../context';
import { NavSubList } from '../sub-list';

export type NavSubProps = {
	icon?: ReactNode;
	label: string;
	children: ReactNode;
	className?: string;
	isActive?: boolean;
	isTrail?: boolean;
	defaultOpen?: boolean;
	disabled?: boolean;
	popoverSide?: 'top' | 'right' | 'bottom' | 'left';
};

const NavRow = NavButton;

export function NavSub({
	icon,
	label,
	children,
	className,
	isActive = false,
	isTrail = false,
	defaultOpen = false,
	disabled = false,
	popoverSide = 'right',
}: NavSubProps) {
	const { compact } = useNav();
	const inPath = isActive || isTrail;
	const trail = isTrail && !isActive ? true : undefined;
	const [open, setOpen] = useState(defaultOpen || inPath);
	const [wasInPath, setWasInPath] = useState(inPath);

	if (inPath !== wasInPath) {
		setWasInPath(inPath);
		if (inPath) setOpen(true);
	}

	if (compact) {
		return (
			<PopoverRoot>
				<PopoverTrigger
					disabled={disabled}
					openOnHover={!disabled}
					delay={80}
					render={
						<NavRow
							icon={icon}
							label={label}
							isActive={isActive}
							data-trail={trail}
							disabled={disabled}
							tooltip={false}
							className={className}
						/>
					}
				/>
				<PopoverPortal>
					<PopoverPositioner side={popoverSide} align="start">
						<PopoverPopup className="w-56 p-1.5">
							<PopoverTitle className="px-2 py-1 text-xs font-medium text-muted-foreground">
								{label}
							</PopoverTitle>
							<NavSubList inert={disabled} className="ms-0 me-0 border-s-0 ps-1">
								{children}
							</NavSubList>
						</PopoverPopup>
					</PopoverPositioner>
				</PopoverPortal>
			</PopoverRoot>
		);
	}

	return (
		<CollapsibleRoot open={open} onOpenChange={setOpen} disabled={disabled}>
			<BaseCollapsible.Trigger
				data-slot="nav-sub-trigger"
				render={
					<NavRow
						icon={icon}
						label={label}
						isActive={isActive}
						data-trail={trail}
						disabled={disabled}
						className={cn('group', className)}
					>
						<CollapsibleIcon className="ms-auto" />
					</NavRow>
				}
			/>
			<CollapsiblePanel>
				<NavSubList inert={disabled}>{children}</NavSubList>
			</CollapsiblePanel>
		</CollapsibleRoot>
	);
}
