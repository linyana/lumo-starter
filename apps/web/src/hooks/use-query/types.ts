import type { Paginated, SortOrder } from '@lumo/shared';
import type { ReactNode } from 'react';
import type { FormInstance, FormValues } from '@/components/ui/form/form/types';

export type ListQuery = {
	page: number;
	pageSize: number;
	search?: string;
	sort?: string;
	order?: SortOrder;
};

export type SortKeyOf<TQuery> = NonNullable<TQuery extends { sort?: infer Key } ? Key : never> &
	string;

export type ListSort<Key extends string = string> = { key: Key; order: SortOrder };

export type ListState<TQuery extends ListQuery> = {
	page: number;
	pageSize: number;
	sort?: ListSort<SortKeyOf<TQuery>>;
	filters: ListFilters<TQuery>;
};

export type ListOwnedKey = 'page' | 'pageSize' | 'sort' | 'order';

export type ListFilters<TQuery extends ListQuery> = Omit<TQuery, ListOwnedKey>;

export type FilterKey<TQuery extends ListQuery> = keyof ListFilters<TQuery> & string;

export type UseQueryOptions<TItem, TQuery extends ListQuery> = {
	fetcher: (query: TQuery) => Promise<Paginated<TItem>>;
	pageSize?: number;
	sync?: boolean;
};

export type ListWait = 'opening' | 'refreshing' | null;

export type ListFilter = {
	field: ReactNode;
	active?: boolean;
	clear?: () => void;
	className?: string;
};

export type UseQueryResult<TItem, TQuery extends ListQuery> = {
	items: TItem[];
	total: number;
	pageCount: number;
	page: number;
	pageSize: number;
	filters: ListFilters<TQuery>;
	opened: ListFilters<TQuery>;
	narrowed: boolean;
	sort?: ListSort<SortKeyOf<TQuery>>;
	wait: ListWait;
	error?: string;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	onSort: (next: ListSort<SortKeyOf<TQuery>> | undefined) => void;
	reload: () => void;
	clearFilters: () => void;
	clearFilter: (name: FilterKey<TQuery>) => void;
	filterOf: (args: { name: FilterKey<TQuery>; placeholder?: string }) => ListFilter;
	form: FormInstance;
	write: (values: FormValues) => void;
};
