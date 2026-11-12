import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useForm } from '@/components/pro/form';
import { useHttp } from '../use-http';
import { stateFromParams, paramsFromState, emptyState } from './params';
import type {
	ListFilters,
	ListQuery,
	ListState,
	ListSort,
	SortKeyOf,
	UseQueryOptions,
	UseQueryResult,
} from './types';

export type {
	ListFilters,
	ListQuery,
	ListState,
	ListSort,
	SortKeyOf,
	UseQueryOptions,
	UseQueryResult,
} from './types';

const DEFAULT_PAGE_SIZE = 10;

/**
 * One page of records and the way through them: `useHttp` under the hood, with the page, the order
 * and what the reader narrowed on beside it. The screen renders what this hands back and never
 * assembles a query itself.
 *
 * What the reader narrows on is not this hook's state — it is a form's. `form` is the instance the
 * screen hands to `<Form form>`, and `write` is what that form calls on every change: the fields are
 * the filters, so `<Form>` owns what they hold and this owns what was last read, in the address bar.
 *
 * ```tsx
 * const users = useQuery({ fetcher: usersApi.list, sort: 'createdAt' });
 * <Form form={users.form} initial={users.opened} onChange={users.write} settle={300}>
 * ```
 *
 * The effect owns the first read and every change of a filter, the page or the order, so a screen
 * holds no `useEffect` of its own. The failure is not toasted: a list says it where the records go.
 */
export const useQuery = <TItem, TQuery extends ListQuery>({
	fetcher,
	sort: initialSort,
	order: initialOrder = 'desc',
	pageSize = DEFAULT_PAGE_SIZE,
	sync = true,
}: UseQueryOptions<TItem, TQuery>): UseQueryResult<TItem, TQuery> => {
	const [searchParams, setSearchParams] = useSearchParams();
	const form = useForm();

	// The address bar opens the screen and the hook's own state is where the reader goes from there,
	// so the URL is read once — and only when it is the URL this hook writes, which a second list on
	// the same screen is not.
	const [opened] = useState<ListState<TQuery>>(() =>
		sync
			? stateFromParams<TQuery>({ params: searchParams, sort: initialSort, order: initialOrder })
			: emptyState<TQuery>({ sort: initialSort, order: initialOrder }),
	);

	const [page, setPage] = useState(opened.page);
	const [sort, setSort] = useState<ListSort<SortKeyOf<TQuery>>>(opened.sort);
	const [filters, setFilters] = useState<ListFilters<TQuery>>(opened.filters);

	// Whether anything is narrowed, which is what a blank list is asked to explain: "nothing matched"
	// and "there is nothing yet" are two sentences about the same empty row.
	const narrowed = Object.values(filters).some((value) =>
		Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '',
	);

	const { data, loading, error, initial, fetchData } = useHttp({ fn: fetcher, toastError: false });

	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	/**
	 * What a change in the fields means: the filters are exactly what the fields hold, and the records
	 * under the cursor have moved, so the next read starts over from the first page.
	 */
	const write = useCallback((values: Record<string, unknown>): void => {
		setFilters(values as ListFilters<TQuery>);
		setPage(1);
	}, []);

	const reload = useCallback(() => {
		// `owned` is annotated so its `order` widens to the wire's: the two halves together are exactly
		// `TQuery`, which is what the fetcher takes.
		const owned: ListQuery = { page, pageSize, sort: sort.key, order: sort.order };
		void fetchData({ ...filters, ...owned } as TQuery);
	}, [fetchData, filters, page, pageSize, sort]);

	// The whole of the reading: the first answer, and every change of a settled filter, a page or an
	// order. Both halves are state, so their identity moves only when the reader writes one.
	useEffect(() => {
		reload();
	}, [reload]);

	// A page that no longer exists — the last record of the last page was just deleted, or the URL
	// asked for one — is answered by going back to the last page there is.
	useEffect(() => {
		if (data !== null && page > pageCount) setPage(pageCount);
	}, [data, page, pageCount]);

	// What the reader is looking at, handed to the address bar: the page, the order and the filters,
	// and nothing at all while they are still the screen's own. Compared first, because a query that
	// has not changed is not a navigation.
	useEffect(() => {
		if (!sync) return;

		const next = paramsFromState<TQuery>({
			state: { page, sort, filters },
			sort: initialSort,
			order: initialOrder,
		});
		if (next.toString() === searchParams.toString()) return;

		setSearchParams(next, { replace: true });
	}, [sync, page, sort, filters, searchParams, setSearchParams, initialSort, initialOrder]);

	// Sorting is a query of its own, so it starts from the first page and the list's own order is
	// where a cleared column lands.
	const onSort = useCallback(
		(next: ListSort<SortKeyOf<TQuery>> | undefined) => {
			setSort(next ?? { key: initialSort, order: initialOrder });
			setPage(1);
		},
		[initialSort, initialOrder],
	);

	// The way back to the whole list: the fields are redrawn empty in one write, so it is one read and
	// not one per key. What the list was opened with goes too — a reader who asks for everything wants
	// everything, not the filters they were handed on arrival.
	const clearFilters = useCallback(() => {
		form.seed({});
		form.reset();
		write({});
	}, [form, write]);

	const clearFilter = useCallback(
		(name: string) => {
			form.reset(name);
			setFilters((was) => {
				const next = { ...was };
				delete next[name as keyof ListFilters<TQuery>];
				return next;
			});
			setPage(1);
		},
		[form],
	);

	return {
		items: data?.items ?? [],
		total,
		pageCount,
		page,
		pageSize,
		filters,
		opened: opened.filters,
		narrowed,
		sort,
		loading,
		initial,
		error: error?.message,
		setPage,
		onSort,
		reload,
		clearFilters,
		clearFilter,
		form,
		write,
	};
};
