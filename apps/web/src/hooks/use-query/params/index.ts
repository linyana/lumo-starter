import { PAGE_SIZE_MAX, PAGE_SIZE_MIN } from '@lumo/shared';
import type { ListFilters, ListOwnedKey, ListQuery, ListState, SortKeyOf } from '../types';

const owned: ReadonlySet<string> = new Set([
	'page',
	'pageSize',
	'sort',
	'order',
] satisfies ListOwnedKey[]);

const valueOf = (raw: string): string | boolean =>
	raw === 'true' ? true : raw === 'false' ? false : raw;

export const emptyState = <TQuery extends ListQuery>({
	pageSize,
}: {
	pageSize: number;
}): ListState<TQuery> => ({
	page: 1,
	pageSize,
	filters: {} as ListFilters<TQuery>,
});

export const stateFromParams = <TQuery extends ListQuery>({
	params,
	pageSize: fallbackPageSize,
}: {
	params: URLSearchParams;
	pageSize: number;
}): ListState<TQuery> => {
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
		if (value === undefined || value === null || value === '') continue;
		params.set(key, String(value));
	}

	return params;
};
