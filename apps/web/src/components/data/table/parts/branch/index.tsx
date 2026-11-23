import { ChevronRight } from 'lucide-react';
import { use, type ReactNode } from 'react';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { TableContext } from '../context';
import { headControl, textOf } from '../head';

const branchToggle = cn(
	headControl,
	iconSlot,
	'[&_svg]:transition-transform [&_svg]:duration-(--duration-state)',
	'[&[aria-expanded=true]>svg]:rotate-90',
);

export type TableBranchProps = {
	children: ReactNode;
	hasChildren?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	label?: string;
	className?: string;
};

export function TableBranch({
	children,
	hasChildren = true,
	open = false,
	onOpenChange,
	label,
	className,
}: TableBranchProps) {
	const table = use(TableContext);
	const name = label ?? textOf(children);
	const word = open ? table.locale.collapse : table.locale.expand;

	return (
		<span
			data-slot="table-branch"
			className={cn(
				'inline-flex max-w-full min-w-0 items-center gap-1.5',
				'ps-[calc(var(--table-depth,0)*var(--spacing)*6)]',
				className,
			)}
		>
			{hasChildren ? (
				<button
					type="button"
					data-slot="table-branch-toggle"
					aria-expanded={open}
					aria-label={name === undefined ? word : `${word} ${name}`}
					onClick={() => onOpenChange?.(!open)}
					className={branchToggle}
				>
					<ChevronRight />
				</button>
			) : (
				<span aria-hidden className="size-6 shrink-0" />
			)}
			<span className="min-w-0 truncate">{children}</span>
		</span>
	);
}
