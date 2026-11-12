import type { SortOrder } from '@lumo/shared';
import type { ListFilters, ListQuery, ListState, SortKeyOf } from '../types';

/**
 * The URL a list screen writes itself into. A list is a view of a query, and a query that lives only
 * in component state is gone on reload and cannot be sent to anyone — so the page, the order and
 * every filter are read out of the query string once, and written back to it after that.
 *
 * The reader cannot be trusted with a query string, so it is read defensively: a page that is not a
 * positive whole number is the first one, an order that is neither `asc` nor `desc` is the screen's
 * own, and a key the list does not own is a filter. What a filter is *named* stays the API's
 * business — the screen's schema is the only thing that knows which sort keys exist, so an unknown
 * one comes back as a sentence the reader can see rather than as a crash.
 */

/** The keys the list owns. Every other key in the query string is a filter. */
const owned = ['page', 'sort', 'order'];

/** A flag is written as `true` or `false`, so it is read back as one; everything else is text. */
const valueOf = (raw: string): string | boolean =>
	raw === 'true' ? true : raw === 'false' ? false : raw;

/** The screen's own query: the first page, the order it opens in, and nothing narrowed. */
export const emptyState = <TQuery extends ListQuery>({
	sort,
	order,
}: {
	sort: SortKeyOf<TQuery>;
	order: SortOrder;
}): ListState<TQuery> => ({
	page: 1,
	sort: { key: sort, order },
	filters: {} as ListFilters<TQuery>,
});

/** What the URL says the reader was looking at, or the screen's own query where it says nothing. */
export const stateFromParams = <TQuery extends ListQuery>({
	params,
	sort: fallbackSort,
	order: fallbackOrder,
}: {
	params: URLSearchParams;
	sort: SortKeyOf<TQuery>;
	order: SortOrder;
}): ListState<TQuery> => {
	// No page at all is `0` rather than a number, which the check below reads as "the first one".
	const page = Number(params.get('page'));
	const order = params.get('order');

	return {
		page: Number.isInteger(page) && page > 0 ? page : 1,
		sort: {
			key: (params.get('sort') ?? fallbackSort) as SortKeyOf<TQuery>,
			order: order === 'asc' || order === 'desc' ? order : fallbackOrder,
		},
		filters: Object.fromEntries(
			[...params]
				.filter(([key, value]) => !owned.includes(key) && value !== '')
				.map(([key, value]) => [key, valueOf(value)]),
		) as unknown as ListFilters<TQuery>,
	};
};

/**
 * The same state as a query string. The screen's own order and its first page are the absence of a
 * parameter, so a list nobody has touched has a bare URL, and the filters are written in one order
 * always — the writer compares this string with the one in the address bar to tell whether there is
 * anything to write at all.
 */
export const paramsFromState = <TQuery extends ListQuery>({
	state,
	sort: fallbackSort,
	order: fallbackOrder,
}: {
	state: ListState<TQuery>;
	sort: SortKeyOf<TQuery>;
	order: SortOrder;
}): URLSearchParams => {
	const params = new URLSearchParams();

	if (state.page > 1) params.set('page', String(state.page));
	if (state.sort.key !== fallbackSort || state.sort.order !== fallbackOrder) {
		params.set('sort', state.sort.key);
		params.set('order', state.sort.order);
	}

	const filters = Object.entries(state.filters as Record<string, unknown>).sort(([a], [b]) =>
		a.localeCompare(b),
	);
	for (const [key, value] of filters) {
		// A blank filter is not a filter: it is dropped here for the same reason it is dropped on the
		// way in, so the address bar never carries a parameter the wire would leave out.
		if (value === undefined || value === null || value === '') continue;
		params.set(key, String(value));
	}

	return params;
};
