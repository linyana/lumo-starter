import type { Paginated } from '@lumo/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHttp } from '../use-http';
import type { ListQuery, ListSort, SortKeyOf, UseListOptions, UseListResult } from './types';

export type { ListQuery, ListSort, SortKeyOf, UseListOptions, UseListResult } from './types';

const DEFAULT_PAGE_SIZE = 10;

/**
 * One page of records and the way through them: `useHttp` under the hood, with the page, the search
 * and the sort beside it. A screen renders what this hands back and never assembles a query itself.
 *
 * ```tsx
 * const users = useList(usersApi.list, { sort: 'createdAt', order: 'desc' });
 * users.items / users.page / users.sort / users.setPage / users.setSearch / users.onSort
 * ```
 *
 * The effect owns the first read and every change of page, search or sort, so a screen holds no
 * `useEffect` of its own. The failure is not toasted: a list says it where the records go.
 */
export const useList = <TItem, TQuery extends ListQuery>(
	fetcher: (query: TQuery) => Promise<Paginated<TItem>>,
	{
		sort: initialSort,
		order: initialOrder = 'desc',
		query,
		pageSize = DEFAULT_PAGE_SIZE,
	}: UseListOptions<TQuery>,
): UseListResult<TItem, TQuery> => {
	const [page, setPage] = useState(1);
	const [search, setSearchValue] = useState('');
	const [sort, setSort] = useState<ListSort<SortKeyOf<TQuery>>>({
		key: initialSort,
		order: initialOrder,
	});

	// The caller writes `query` inline, so its identity changes on every render while its fields do
	// not. The latest one lives in a ref for the request to read; `key` is what an effect can watch.
	const fixed = useRef(query);
	useEffect(() => {
		fixed.current = query;
	});
	const key = JSON.stringify(query ?? null);

	const { data, loading, error, fetchData } = useHttp(fetcher, { toastError: false });

	const reload = useCallback(() => {
		const narrowed = search.trim();
		// The fields the hook owns, apart from the ones the caller fixed. `owned` is annotated so the
		// sort key widens to the wire's `string`; together the two halves are exactly `TQuery`.
		const owned: ListQuery = {
			page,
			pageSize,
			sort: sort.key,
			order: sort.order,
			...(narrowed ? { search: narrowed } : {}),
		};
		void fetchData({ ...fixed.current, ...owned } as TQuery);
	}, [fetchData, page, pageSize, search, sort]);

	useEffect(() => {
		reload();
	}, [reload, key]);

	const setSearch = useCallback((next: string) => {
		setSearchValue(next);
		setPage(1);
	}, []);

	// Sorting is a query of its own, so it starts from the first page and the list's own order is
	// where a cleared column lands.
	const onSort = useCallback(
		(next: ListSort<SortKeyOf<TQuery>> | undefined) => {
			setSort(next ?? { key: initialSort, order: initialOrder });
			setPage(1);
		},
		[initialSort, initialOrder],
	);

	const total = data?.total ?? 0;

	return {
		items: data?.items ?? [],
		total,
		pageCount: Math.max(1, Math.ceil(total / pageSize)),
		page,
		pageSize,
		search,
		sort,
		loading,
		error: error?.message,
		setPage,
		setSearch,
		onSort,
		reload,
	};
};
