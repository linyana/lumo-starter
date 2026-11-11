import type { Paginated } from '@lumo/shared';
import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router';
import { useHttp } from '../use-http';
import { emptyState, paramsFromState, stateFromParams } from './params';
import type {
	BooleanFilterKey,
	ListFilters,
	ListQuery,
	ListSort,
	ListState,
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
	ListState,
	SortKeyOf,
	StringFilterKey,
	TextBinding,
	UseListOptions,
	UseListResult,
} from './types';

const DEFAULT_PAGE_SIZE = 10;

/** How long a field is typed into before the list is read again. A pause, not a wait. */
const DEFAULT_DEBOUNCE = 300;

/**
 * The filters as the controls have them, and how the last one arrived. A field typed into is
 * `typing`: another keystroke may be a millisecond away, so its write is read after a pause rather
 * than once per character. Every other control answers once — a select, a row of buttons, a switch —
 * so there is no burst to collapse and its write is read at once.
 */
type FilterInput<TQuery extends ListQuery> = {
	values: ListFilters<TQuery>;
	typing: boolean;
};

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
 *
 * A field typed into waits for a pause before its write is read (`debounce`), so a search box asks
 * once and not once per character; a control that is picked is one answer and is read at once. The
 * page, the order and the filters are kept in the address bar (`sync`), so a list survives a reload
 * and can be sent to someone.
 */
export const useList = <TItem, TQuery extends ListQuery>({
	fetcher,
	sort: initialSort,
	order: initialOrder = 'desc',
	defaultFilters,
	pageSize = DEFAULT_PAGE_SIZE,
	debounce = DEFAULT_DEBOUNCE,
	sync = true,
}: {
	fetcher: (query: TQuery) => Promise<Paginated<TItem>>;
} & UseListOptions<TQuery>): UseListResult<TItem, TQuery> => {
	const [searchParams, setSearchParams] = useSearchParams();

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

	// From the first render on, the filters are the hook's own state: the screen states the ones it
	// opens with, the reader's changes land here, and the settled copy of this one object is what the
	// wire reads.
	const [input, setInput] = useState<FilterInput<TQuery>>(
		// A filter the URL named is the reader's own, so it is read over one written inline — and the
		// object is built once, so a `defaultFilters` written inline is not read again every render.
		() => ({
			values: { ...defaultFilters, ...opened.filters } as ListFilters<TQuery>,
			typing: false,
		}),
	);

	const filters = input.values;

	/**
	 * What the wire reads: the filters the controls show, once the reader has stopped writing them.
	 * The pause is the field's and not the control's — a keystroke is one of many, a pick is one — and
	 * the first page comes back with the settled filters, because the records under the cursor are
	 * about to be different ones.
	 *
	 * `input.values === settled` is "nothing was written", which is the state the hook opens in, so a
	 * screen opened from a URL keeps the page that URL named instead of being sent to the first one.
	 */
	const [settled, setSettled] = useState(filters);
	useEffect(() => {
		if (input.values === settled) return;

		const settle = () => {
			setSettled(input.values);
			setPage(1);
		};

		if (!input.typing) {
			settle();
			return;
		}

		const timer = setTimeout(settle, debounce);
		return () => clearTimeout(timer);
	}, [input, settled, debounce]);

	const { data, loading, error, fetchData } = useHttp({ fn: fetcher, toastError: false });

	const total = data?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	// One write, one rule: a blank filter is not a filter — dropped here, the field reads as empty and
	// the wire carries no parameter for it, because axios leaves an `undefined` out of the query string,
	// so a cleared box asks for the unnarrowed list. `typing` is the only thing that differs between a
	// field and a control, and it decides one thing: whether the read waits for a pause.
	const write = useCallback(
		<Key extends keyof ListFilters<TQuery>>({
			key,
			value,
			typing,
		}: {
			key: Key;
			value: ListFilters<TQuery>[Key] | null | undefined;
			typing: boolean;
		}): void => {
			setInput((previous) => ({
				values: {
					...previous.values,
					[key]: value === '' || value === null ? undefined : value,
				} as ListFilters<TQuery>,
				typing,
			}));
		},
		[],
	);

	// A control that is picked is one answer, given once: nothing is collapsed, so it is read at once.
	// A field typed into asks for the pause instead — that is `text` below.
	const setFilter = useCallback(
		<Key extends keyof ListFilters<TQuery>>(
			key: Key,
			value: ListFilters<TQuery>[Key] | null | undefined,
		): void => write({ key, value, typing: false }),
		[write],
	);

	const reload = useCallback(() => {
		// `owned` is annotated so its `order` widens to the wire's: the two halves together are exactly
		// `TQuery`, which is what the fetcher takes.
		const owned: ListQuery = { page, pageSize, sort: sort.key, order: sort.order };
		void fetchData({ ...settled, ...owned } as TQuery);
	}, [fetchData, settled, page, pageSize, sort]);

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

	// What the reader is looking at, handed to the address bar: the page, the order and the settled
	// filters, and nothing at all while they are still the screen's own. Compared first, because a
	// query that has not changed is not a navigation.
	useEffect(() => {
		if (!sync) return;

		const next = paramsFromState<TQuery>({
			state: { page, sort, filters: settled },
			sort: initialSort,
			order: initialOrder,
		});
		if (next.toString() === searchParams.toString()) return;

		setSearchParams(next, { replace: true });
	}, [sync, page, sort, settled, searchParams, setSearchParams, initialSort, initialOrder]);

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
	// its own control already takes. `text` is the paused one, because typing is the only thing that
	// arrives faster than a list can be read; the other two are read at once. The key's type is the
	// schema's, which the wire alone can check, so a text field keeps the caller's word for it.
	const text = <Key extends StringFilterKey<TQuery>>(key: Key) => ({
		value: (filters[key] as string | undefined) ?? '',
		onChange: (event: ChangeEvent<HTMLInputElement>) =>
			write({ key, value: event.target.value as ListFilters<TQuery>[Key], typing: true }),
	});

	const choice = <Key extends StringFilterKey<TQuery>>(key: Key) => ({
		value: (filters[key] ?? null) as NonNullable<ListFilters<TQuery>[Key]> | null,
		onValueChange: (value: ListFilters<TQuery>[Key] | null) => write({ key, value, typing: false }),
	});

	const flag = <Key extends BooleanFilterKey<TQuery>>(key: Key) => ({
		checked: filters[key] === true,
		onCheckedChange: (checked: boolean) =>
			write({ key, value: checked as ListFilters<TQuery>[Key], typing: false }),
	});

	return {
		items: data?.items ?? [],
		total,
		pageCount,
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
