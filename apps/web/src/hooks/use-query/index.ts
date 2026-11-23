import { PAGE_SIZE_DEFAULT, pageCountOf } from '@lumo/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useForm, type FormValues } from '@/components/form/form';
import { sameValues } from '@/lib';
import { useHttp } from '../use-http';
import { textFilter } from './filter';
import { emptyState, paramsFromState, stateFromParams } from './params';
import type {
	FilterKey,
	ListFilter,
	ListFilters,
	ListQuery,
	ListSort,
	ListState,
	ListWait,
	SortKeyOf,
	UseQueryOptions,
	UseQueryResult,
} from './types';

export type {
	FilterKey,
	ListFilter,
	ListFilters,
	ListQuery,
	ListState,
	ListSort,
	ListWait,
	SortKeyOf,
	UseQueryOptions,
	UseQueryResult,
} from './types';

const isSet = (value: unknown): boolean =>
	Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';

export const useQuery = <TItem, TQuery extends ListQuery>({
	fetcher,
	pageSize: initialPageSize = PAGE_SIZE_DEFAULT,
	sync = true,
}: UseQueryOptions<TItem, TQuery>): UseQueryResult<TItem, TQuery> => {
	const [searchParams, setSearchParams] = useSearchParams();
	const form = useForm();

	const [opened] = useState<ListState<TQuery>>(() =>
		sync
			? stateFromParams<TQuery>({ params: searchParams, pageSize: initialPageSize })
			: emptyState<TQuery>({ pageSize: initialPageSize }),
	);

	const [page, setPage] = useState(opened.page);
	const [pageSize, setPageSizeState] = useState(opened.pageSize);
	const [sort, setSort] = useState<ListSort<SortKeyOf<TQuery>> | undefined>(opened.sort);
	const [filters, setFilters] = useState<ListFilters<TQuery>>(opened.filters);

	const narrowed = Object.values(filters).some(isSet);

	const { data, loading, error, initial, fetchData } = useHttp({
		endpoint: fetcher,
		toastError: false,
	});

	const total = data?.total ?? 0;

	const pageCount = data?.pageCount ?? pageCountOf({ total, pageSize });

	const wait: ListWait = initial ? 'opening' : loading ? 'refreshing' : null;

	const write = useCallback(
		(values: FormValues): void => {
			if (sameValues({ left: filters as FormValues, right: values })) return;

			setFilters(values as ListFilters<TQuery>);
			setPage(1);
		},
		[filters],
	);

	const setPageSize = useCallback((next: number): void => {
		setPageSizeState(next);
		setPage(1);
	}, []);

	const asked = useRef(opened.page);

	const reload = useCallback(() => {
		asked.current = page;
		const owned =
			sort === undefined
				? { page, pageSize }
				: { page, pageSize, sort: sort.key, order: sort.order };
		void fetchData({ ...filters, ...owned } as TQuery);
	}, [fetchData, filters, page, pageSize, sort]);

	useEffect(() => {
		reload();
	}, [reload]);

	useEffect(() => {
		if (data === null) return;
		if (data.page !== asked.current) setPage(data.page);
	}, [data]);

	useEffect(() => {
		if (!sync) return;

		const next = paramsFromState<TQuery>({
			state: { page, pageSize, sort, filters },
			pageSize: initialPageSize,
		});
		if (next.toString() === searchParams.toString()) return;

		setSearchParams(next, { replace: true });
	}, [sync, page, pageSize, sort, filters, searchParams, setSearchParams, initialPageSize]);

	const onSort = useCallback((next: ListSort<SortKeyOf<TQuery>> | undefined) => {
		setSort(next);
		setPage(1);
	}, []);

	const clearFilters = useCallback(() => {
		form.seed({});
		form.reset();
		write({});
	}, [form, write]);

	const clearFilter = useCallback(
		(name: FilterKey<TQuery>) => {
			form.clear(name);
			setFilters((was) => {
				const next = { ...was };
				delete next[name];
				return next;
			});
			setPage(1);
		},
		[form],
	);

	const filterOf = useCallback(
		({ name, placeholder }: { name: FilterKey<TQuery>; placeholder?: string }): ListFilter =>
			textFilter({
				name,
				placeholder,
				active: isSet(filters[name]),
				clear: () => clearFilter(name),
			}),
		[filters, clearFilter],
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
		wait,
		error: error?.message,
		setPage,
		setPageSize,
		onSort,
		reload,
		clearFilters,
		clearFilter,
		filterOf,
		form,
		write,
	};
};
