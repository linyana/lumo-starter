import type { AccessCondition } from '@lumo/shared';
import type { ReactNode } from 'react';
import type { PaginationProps } from '@/components/ui/data/pagination';
import type { ButtonProps } from '@/components/ui/form/button';
import type { MenuEntry } from '@/components/ui/overlay/menu';
import type { SlotClassNames } from '@/components/types';
import type { ListWait } from '@/hooks';
import type { TableFilterProps, TableFixed, TableHeadProps, TableRootProps } from './parts';

export type { TableFilterProps, TableFixed } from '@/components/ui/data/table/parts';

type ColumnAlign = TableHeadProps['align'];

export type TableOrder = 'asc' | 'desc';

export type TableSort<Key extends string = string> = { key: Key; order: TableOrder };

export type TableColumn<Row, Key extends string = string> = {
	key: string;
	header: ReactNode;
	cell: (row: Row) => ReactNode;
	align?: ColumnAlign;
	width?: string;
	fixed?: TableFixed;
	className?: string;
	access?: AccessCondition;
	sortKey?: Key;
	filter?: TableFilterProps;
	menu?: () => MenuEntry[];
};

export type TableSlots =
	| 'root'
	| 'header'
	| 'row'
	| 'head'
	| 'body'
	| 'cell'
	| 'actions'
	| 'selection'
	| 'empty'
	| 'skeleton'
	| 'footer';

export type SelectionChosen<Row> = {
	rows: readonly Row[];
	clear: () => void;
};

export type SelectionAction<Row> = Omit<ButtonProps, 'children' | 'onClick'> & {
	label: ReactNode;
	iconOnly?: boolean;
	destructive?: boolean;
	access?: AccessCondition;
	blocked?: (rows: readonly Row[]) => ReactNode | undefined;
	onClick: (chosen: SelectionChosen<Row>) => void;
};

export type TableList<Row, Key extends string = string> = {
	items: Row[];
	wait: ListWait;
	sort?: TableSort<Key>;
	onSort: (next: TableSort<Key> | undefined) => void;
	page: number;
	pageCount: number;
	pageSize: number;
	total: number;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	error?: string;
	reload: () => void;
	narrowed: boolean;
	clearFilters: () => void;
};

export type TableProps<Row, Key extends string = string> = {
	columns: TableColumn<Row, Key>[];
	list?: TableList<Row, Key>;
	rows?: Row[];
	rowKey?: (row: Row) => string;
	sort?: TableSort<Key>;
	onSortChange?: (next: TableSort<Key> | undefined) => void;
	size?: TableRootProps['size'];
	variant?: TableRootProps['variant'];
	hoverable?: boolean;
	layout?: TableRootProps['layout'];
	wait?: ListWait;
	skeletonRows?: number;
	error?: ReactNode;
	onRetry?: () => void;
	empty?: ReactNode;
	rowActions?: (row: Row) => MenuEntry[];
	selectionActions?: (chosen: readonly Row[]) => SelectionAction<Row>[];
	rowLabel?: (row: Row) => string;
	rowActionsLabel?: (row: Row) => string;
	pagination?: Partial<PaginationProps>;
	className?: string;
	classNames?: SlotClassNames<TableSlots>;
};
