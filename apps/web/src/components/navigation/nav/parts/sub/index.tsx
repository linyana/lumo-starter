import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type { ReactNode } from 'react';
import {
	CollapsibleIcon,
	CollapsiblePanel,
	CollapsibleRoot,
} from '@/components/display/collapsible/parts';
import {
	PopoverPopup,
	PopoverPortal,
	PopoverPositioner,
	PopoverRoot,
	PopoverTitle,
	PopoverTrigger,
} from '@/components/overlay/popover/parts';
import { cn } from '@/lib/utils';
import { NavButton } from '../button';
import { useNav } from '../context';
import { NavSubList } from '../sub-list';

export type NavSubProps = {
	icon?: ReactNode;
	label: string;
	/** `NavSubItem` rows. The same ones serve the inline list and the compact popover. */
	children: ReactNode;
	className?: string;
	/** Highlights the row, so a parent reads as current when one of its children is. */
	isActive?: boolean;
	defaultOpen?: boolean;
	disabled?: boolean;
	/** Which side the popover opens on when the nav is compact. Defaults to the row's right. */
	popoverSide?: 'top' | 'right' | 'bottom' | 'left';
};

const NavRow = NavButton;

/**
 * A row that owns a list of sub rows: it expands inline when the nav has width, and opens a
 * popover instead once it is compact, because there is no room left to expand into.
 */
export function NavSub({
	icon,
	label,
	children,
	className,
	isActive = false,
	defaultOpen = false,
	disabled = false,
	popoverSide = 'right',
}: NavSubProps) {
	const { compact } = useNav();

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
		<CollapsibleRoot defaultOpen={defaultOpen} disabled={disabled}>
			{/* Base UI's own trigger rather than `CollapsibleTrigger`: that one paints a collapsible
			    header, and a nav row already has an appearance of its own. Two looks on one element
			    mean every shared property — padding, text size, the icon's size — is settled by
			    whichever rule lands later in the stylesheet, which is neither look. */}
			<BaseCollapsible.Trigger
				data-slot="nav-sub-trigger"
				render={
					<NavRow
						icon={icon}
						label={label}
						isActive={isActive}
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
