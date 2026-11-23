import { clampPage, PAGE_SIZE_DEFAULT, pageCountOf } from '@lumo/shared';
import { useMemo, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { iconSlot } from '@/lib/control';
import { cn } from '@/lib/utils';
import { PaginationContext } from '../context';
import { defaultLocale } from '../default-locale';

export type PaginationLocale = {
	previous?: string;
	next?: string;
	first?: string;
	last?: string;
	page?: string;
	previousPages?: string;
	nextPages?: string;
	goTo?: string;
};

export const paginationItemVariants = tv({
	base: [
		'inline-flex shrink-0 items-center justify-center rounded-md',
		'select-none whitespace-nowrap tabular-nums font-normal',
		'transition-[color,translate,scale] duration-(--duration-state)',
		iconSlot,
	],
	variants: {
		size: {
			sm: 'h-8 min-w-8 px-2 text-sm',
			md: 'h-9 min-w-9 px-2.5 text-sm',
			lg: 'h-10 min-w-10 px-3 text-base',
		},
	},
	defaultVariants: {
		size: 'md',
	},
});

export type PaginationRootProps = Omit<ComponentProps<'nav'>, 'onChange'> &
	VariantProps<typeof paginationItemVariants> & {
		page: number;
		pageCount?: number;
		total?: number;
		pageSize?: number;
		onPageChange?: (page: number) => void;
		items?: string;
		locale?: PaginationLocale;
		busy?: boolean;
		className?: string;
	};

export function PaginationRoot({
	page,
	pageCount,
	total,
	pageSize,
	size = 'md',
	onPageChange,
	items = 'item',
	locale,
	busy = false,
	className,
	children,
	'aria-label': label = 'pagination',
	...props
}: PaginationRootProps) {
	const words = useMemo(() => ({ ...defaultLocale, ...locale }), [locale]);

	const count = Math.max(
		1,
		pageCount ?? pageCountOf({ total: total ?? 0, pageSize: pageSize ?? PAGE_SIZE_DEFAULT }),
	);
	const current = clampPage({ page, pageCount: count });

	const value = useMemo(() => {
		const go = (next: number) => {
			const to = clampPage({ page: next, pageCount: count });
			if (to !== current) onPageChange?.(to);
		};
		return {
			page: current,
			pageCount: count,
			total,
			pageSize,
			items,
			locale: words,
			size,
			busy,
			go,
		};
	}, [current, count, total, pageSize, items, words, size, busy, onPageChange]);

	return (
		<PaginationContext value={value}>
			<nav
				data-slot="pagination"
				data-size={size}
				aria-label={label}
				aria-busy={busy || undefined}
				className={cn('flex items-center gap-2 aria-busy:cursor-progress', className)}
				{...props}
			>
				{children}
			</nav>
		</PaginationContext>
	);
}
