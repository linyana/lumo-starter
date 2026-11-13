import type { Paginated, SortOrder } from '@lumo/shared';
import type { FormInstance, FormValues } from '@/components/pro/form/types';

/**
 * The part of a list endpoint's query the hook fills in itself: which page, how large, what the
 * reader narrowed on, and how the records are ordered. Every `list*QuerySchema` in `@lumo/shared`
 * starts from it, so any of them is a `ListQuery` plus whatever the screen fixes.
 */
export type ListQuery = {
	page: number;
	pageSize: number;
	search?: string;
	sort?: string;
	order?: SortOrder;
};

/**
 * The keys a list endpoint closes `sort` to — its schema's own union, not any string. Deriving it
 * from the query is what keeps a column and the endpoint it reads in step: a `sortKey` the API does
 * not accept is a type error at the column that names it.
 */
export type SortKeyOf<TQuery> = NonNullable<TQuery extends { sort?: infer Key } ? Key : never> &
	string;

/** The column the records are read by, and which way round. */
export type ListSort<Key extends string = string> = { key: Key; order: SortOrder };

/**
 * Everything a list screen says about itself — the page, the order and what the reader narrowed on.
 * It is one object because it is one query: the wire takes it whole and so does the address bar.
 */
export type ListState<TQuery extends ListQuery> = {
	page: number;
	sort: ListSort<SortKeyOf<TQuery>>;
	filters: ListFilters<TQuery>;
};

/** The keys the hook fills in itself, so a filter is every other key of the query. */
export type ListOwnedKey = 'page' | 'pageSize' | 'sort' | 'order';

/**
 * What the reader narrows the records by: one key each — the search box, a status, a date — held as
 * one object, because one object is what the wire takes.
 */
export type ListFilters<TQuery extends ListQuery> = Omit<TQuery, ListOwnedKey>;

/**
 * What the screen fixes for the life of the query: the order it opens in. The page, the sort the
 * reader picks and what they narrow on are the hook's own state.
 */
export type UseQueryOptions<TItem, TQuery extends ListQuery> = {
	/** The endpoint one read calls; it is handed the whole query, filters and page alike. */
	fetcher: (query: TQuery) => Promise<Paginated<TItem>>;
	/** The column the records read by until the reader picks another. */
	sort: SortKeyOf<TQuery>;
	/** Which way round that column reads. Descending by default: the newest record first. */
	order?: SortOrder;
	/** How many records one page holds. One table's worth by default. */
	pageSize?: number;
	/**
	 * Whether the page, the order and the settled filters live in the address bar. On by default: a
	 * list is a query, and a query is worth a link, a reload and a back button. Turn it off for a
	 * second list sharing a screen with another — one URL cannot carry two queries.
	 */
	sync?: boolean;
};

/**
 * Which wait a read is, if any. It is one word and not two booleans because the two questions behind
 * it — is a read in flight, has anything answered yet — are only interesting together: the wait a
 * list opens with has nothing to keep, and every wait after one keeps what the list last said. Left
 * as booleans, every consumer would combine them again, and the frame between mounting and the call
 * this hook schedules — nothing in flight, still nothing answered — is the one that gets forgotten.
 */
export type ListWait = 'opening' | 'refreshing' | null;

export type UseQueryResult<TItem, TQuery extends ListQuery> = {
	/** The records on the page in view; empty until the first answer lands. */
	items: TItem[];
	/** The records in all, which is where the page count comes from. */
	total: number;
	/** At least one, so a list that has not answered yet still has a page to be on. */
	pageCount: number;
	/** The page in view, counted from one. */
	page: number;
	pageSize: number;
	/** What the fields are narrow on now. */
	filters: ListFilters<TQuery>;
	/** What the address bar said, once: the form's `initial`. */
	opened: ListFilters<TQuery>;
	/**
	 * Whether anything is narrowed. It is what a blank list is asked to explain: a search that matched
	 * nothing is not a list that has nothing, and the two are the same empty row.
	 */
	narrowed: boolean;
	/** The column the records were read by, and which way. The table draws its arrow from this. */
	sort: ListSort<SortKeyOf<TQuery>>;
	/** Which wait this is, if any: `opening` before the first answer, `refreshing` after one. */
	wait: ListWait;
	/** The API's sentence when the last read failed. The caller renders it where the records go. */
	error?: string;
	setPage: (page: number) => void;
	/**
	 * A title was pressed: another column, the other direction round, or nothing — which is the
	 * press after the last direction, and puts the list back in the order the screen asked for.
	 */
	onSort: (next: ListSort<SortKeyOf<TQuery>> | undefined) => void;
	/** Read the same page again — what a write elsewhere in the domain ends with. */
	reload: () => void;
	/** Drop every filter: the fields are redrawn empty and the page goes back to the whole list. */
	clearFilters: () => void;
	/** Drop one filter — what a column's own "Clear filter" does. */
	clearFilter: (name: string) => void;
	/** The fields' values. Handed to `<Form form>` so they are one set with the query. */
	form: FormInstance;
	/** What a change in the fields means: they *are* the filters. `<Form onChange>` calls this. */
	write: (values: FormValues) => void;
};
