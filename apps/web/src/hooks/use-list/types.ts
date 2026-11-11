import type { SortOrder } from '@lumo/shared';

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
 * What the screen fixes for the life of the list: the order it opens in, and anything else its
 * endpoint takes. The page, the search and the sort the reader chooses are the hook's own state.
 */
export type UseListOptions<TQuery extends ListQuery> = {
	/** The column the list reads by until the reader picks another. */
	sort: SortKeyOf<TQuery>;
	/** Which way round that column reads. Descending by default: the newest record first. */
	order?: SortOrder;
	/** Whatever else the endpoint takes. Compared by value, so an inline object is safe. */
	query?: Omit<TQuery, keyof ListQuery>;
	/** How many records one page holds. One table's worth by default. */
	pageSize?: number;
};

export type UseListResult<TItem, TQuery extends ListQuery> = {
	/** The records on the page in view; empty until the first answer lands. */
	items: TItem[];
	/** The records in all, which is where the page count comes from. */
	total: number;
	/** At least one, so a list that has not answered yet still has a page to be on. */
	pageCount: number;
	/** The page in view, counted from one. */
	page: number;
	pageSize: number;
	/** What the reader typed. Empty means the records are not narrowed at all. */
	search: string;
	/** The column the records were read by, and which way. The table draws its arrow from this. */
	sort: ListSort<SortKeyOf<TQuery>>;
	loading: boolean;
	/** The API's sentence when the last read failed. The caller renders it where the records go. */
	error?: string;
	setPage: (page: number) => void;
	/** Goes back to the first page: the records under the cursor have moved. */
	setSearch: (search: string) => void;
	/**
	 * A title was pressed: another column, the other direction round, or nothing — which is the
	 * press after the last direction, and puts the list back in the order the screen asked for.
	 */
	onSort: (next: ListSort<SortKeyOf<TQuery>> | undefined) => void;
	/** Read the same page again — what a write elsewhere in the domain ends with. */
	reload: () => void;
};
