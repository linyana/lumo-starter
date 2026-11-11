import type { Paginated } from '@lumo/shared';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useHttp } from '../use-http';
import type {
	BooleanFilterKey,
	ListFilters,
	ListQuery,
	ListSort,
	SortKeyOf,
	StringFilterKey,
	UseListOptions,
	UseListResult,
} from './types';

export type {
	BooleanFilterKey,
	ChoiceBinding,
	FlagBinding,
	ListFilters,
	ListQuery,
	ListSort,
	ListOwnedKey,
	SortKeyOf,
	StringFilterKey,
	TextBinding,
	UseListOptions,
	UseListResult,
} from './types';

const DEFAULT_PAGE_SIZE = 10;

/**
 * One page of records and the way through them: `useHttp` under the hood, with the page, the
 * filters and the sort beside it. A screen renders what this hands back and never assembles a query
 * itself, and the controls it draws are handed their own props rather than being wired by hand.
 *
 * ```tsx
 * const users = useList({ fetcher: usersApi.list, sort: 'createdAt', order: 'desc' });
 * <Input placeholder="Search" {...users.text('search')} />
 * users.items / users.page / users.sort / users.setPage / users.onSort
 * ```
 *
 * The effect owns the first read and every change of a filter, the page or the sort, so a screen
 * holds no `useEffect` and no state of its own. The failure is not toasted: a list says it where the
 * records go.
 */
export const useList = <TItem, TQuery extends ListQuery>({
	fetcher,
	sort: initialSort,
	order: initialOrder = 'desc',
	defaultFilters,
	pageSize = DEFAULT_PAGE_SIZE,
}: {
	fetcher: (query: TQuery) => Promise<Paginated<TItem>>;
} & UseListOptions<TQuery>): UseListResult<TItem, TQuery> => {
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState<ListSort<SortKeyOf<TQuery>>>({
		key: initialSort,
		order: initialOrder,
	});

	// From the first render on, the filters are the hook's own state: the screen states the ones it
	// opens with, the reader's changes land here, and the wire is assembled from this one object.
	// Seeded once, so a `defaultFilters` written inline is not read again on every render.
	const [filters, setFilters] = useState<ListFilters<TQuery>>(
		() => (defaultFilters ?? {}) as ListFilters<TQuery>,
	);

	const { data, loading, error, fetchData } = useHttp({ fn: fetcher, toastError: false });

	// One write, one rule: the records under the cursor have moved, so the reader is back on page one.
	const setFilter = useCallback(
		<Key extends keyof ListFilters<TQuery>>(
			key: Key,
			value: ListFilters<TQuery>[Key] | null | undefined,
		): void => {
			setFilters(
				(previous) =>
					({
						...previous,
						// A blank filter is not a filter: dropped here, the field reads as empty and the
						// wire carries no parameter for it — axios leaves an `undefined` out of the query
						// string, so a cleared box asks for the unnarrowed list.
						[key]: value === '' || value === null ? undefined : value,
					}) as ListFilters<TQuery>,
			);
			setPage(1);
		},
		[],
	);

	const reload = useCallback(() => {
		// `owned` is annotated so its `order` widens to the wire's: the two halves together are exactly
		// `TQuery`, which is what the fetcher takes.
		const owned: ListQuery = { page, pageSize, sort: sort.key, order: sort.order };
		void fetchData({ ...filters, ...owned } as TQuery);
	}, [fetchData, filters, page, pageSize, sort]);

	// The whole of the reading: the first answer, and every change of a filter, a page or an order.
	// `filters` is state, so its identity moves only when the reader writes one.
	useEffect(() => {
		reload();
	}, [reload]);

	// Sorting is a query of its own, so it starts from the first page and the list's own order is
	// where a cleared column lands.
	const onSort = useCallback(
		(next: ListSort<SortKeyOf<TQuery>> | undefined) => {
			setSort(next ?? { key: initialSort, order: initialOrder });
			setPage(1);
		},
		[initialSort, initialOrder],
	);

	// The three shapes a control reports a value by, each pairing a key of the query with the props
	// its own control already takes. A field being typed into writes what was typed; the key's type
	// is the schema's, which the wire alone can check, so a text field keeps the caller's word for it.
	const text = <Key extends StringFilterKey<TQuery>>(key: Key) => ({
		value: (filters[key] as string | undefined) ?? '',
		onChange: (event: ChangeEvent<HTMLInputElement>) =>
			setFilter(key, event.target.value as ListFilters<TQuery>[Key]),
	});

	const choice = <Key extends StringFilterKey<TQuery>>(key: Key) => ({
		value: (filters[key] ?? null) as NonNullable<ListFilters<TQuery>[Key]> | null,
		onValueChange: (value: ListFilters<TQuery>[Key] | null) => setFilter(key, value),
	});

	const flag = <Key extends BooleanFilterKey<TQuery>>(key: Key) => ({
		checked: filters[key] === true,
		onCheckedChange: (checked: boolean) => setFilter(key, checked as ListFilters<TQuery>[Key]),
	});

	const total = data?.total ?? 0;

	return {
		items: data?.items ?? [],
		total,
		pageCount: Math.max(1, Math.ceil(total / pageSize)),
		page,
		pageSize,
		filters,
		sort,
		loading,
		error: error?.message,
		setPage,
		setFilter,
		onSort,
		reload,
		text,
		choice,
		flag,
	};
};
