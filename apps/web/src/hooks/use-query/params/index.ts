import { PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '@lumo/shared';
import type { ListFilters, ListOwnedKey, ListQuery, ListState, SortKeyOf } from '../types';

/**
 * The URL a list screen writes itself into. A list is a view of a query, and a query that lives only
 * in component state is gone on reload and cannot be sent to anyone — so the page, the size, the
 * order and every filter are read out of the query string once, and written back to it after that.
 *
 * The order is a column *and* a direction, so it is read as one pair: half of one is no order at all,
 * which is the endpoint's own. That is also why a list nobody has sorted carries no `sort` rather than
 * the endpoint's default spelled out — the default is the API's to declare, and a screen that said it
 * too would be a second copy of it right up until the two disagreed.
 *
 * The reader cannot be trusted with a query string, so it is read defensively: a page that is not a
 * positive whole number is the first one, a size outside the range the API accepts is the screen's
 * own, and a key the list does not own is a filter. What a filter is *named* stays the API's business —
 * the screen's schema is the only thing that knows which sort keys exist, so an unknown one comes back
 * as a sentence the reader can see rather than as a crash.
 */

/**
 * The keys the list owns: what the hook fills in itself, so every other key in the query string is a
 * filter. It is checked against `ListOwnedKey`, so the two cannot drift apart in silence.
 */
const owned: ReadonlySet<string> = new Set([
	'page',
	'pageSize',
	'sort',
	'order',
] satisfies ListOwnedKey[]);

/** A flag is written as `true` or `false`, so it is read back as one; everything else is text. */
const valueOf = (raw: string): string | boolean =>
	raw === 'true' ? true : raw === 'false' ? false : raw;

/**
 * The screen's own query: the first page, the size it opens at and nothing narrowed. No order, which
 * is the endpoint reading the records the way it reads them. `pageSize` here is the one the screen
 * asked for, and the one a URL that names none falls back to.
 */
export const emptyState = <TQuery extends ListQuery>({
	pageSize,
}: {
	pageSize: number;
}): ListState<TQuery> => ({
	page: 1,
	pageSize,
	filters: {} as ListFilters<TQuery>,
});

/** What the URL says the reader was looking at, or the screen's own query where it says nothing. */
export const stateFromParams = <TQuery extends ListQuery>({
	params,
	pageSize: fallbackPageSize,
}: {
	params: URLSearchParams;
	pageSize: number;
}): ListState<TQuery> => {
	// No page at all is `0` rather than a number, which the check below reads as "the first one".
	const page = Number(params.get('page'));
	const size = Number(params.get('pageSize'));
	const key = params.get('sort');
	const order = params.get('order');

	return {
		page: Number.isInteger(page) && page > 0 ? page : 1,
		pageSize:
			Number.isInteger(size) && size >= PAGE_SIZE_MIN && size <= PAGE_SIZE_MAX
				? size
				: fallbackPageSize,
		sort:
			key === null || (order !== 'asc' && order !== 'desc')
				? undefined
				: { key: key as SortKeyOf<TQuery>, order },
		filters: Object.fromEntries(
			[...params]
				.filter(([key, value]) => !owned.has(key) && value !== '')
				.map(([key, value]) => [key, valueOf(value)]),
		) as unknown as ListFilters<TQuery>,
	};
};

/**
 * The same state as a query string. No order, its first page and the size it opens at are the absence
 * of a parameter, so a list nobody has touched has a bare URL, and the filters are written in one
 * order always — the writer compares this string with the one in the address bar to tell whether
 * there is anything to write at all.
 */
export const paramsFromState = <TQuery extends ListQuery>({
	state,
	pageSize: fallbackPageSize,
}: {
	state: ListState<TQuery>;
	pageSize: number;
}): URLSearchParams => {
	const params = new URLSearchParams();

	if (state.page > 1) params.set('page', String(state.page));
	if (state.pageSize !== fallbackPageSize) params.set('pageSize', String(state.pageSize));
	if (state.sort !== undefined) {
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
