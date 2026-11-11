import type { SortOrder } from '@lumo/shared';
import type { ChangeEvent } from 'react';

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

/** The keys the hook fills in itself, so a filter is every other key of the query. */
export type ListOwnedKey = 'page' | 'pageSize' | 'sort' | 'order';

/**
 * What the reader narrows the records by: one key each — the search box, a status, a date — held as
 * one object, because one object is what the wire takes. `search` is a filter like any other and
 * nothing more, which is why it is typed here rather than kept apart and bound separately.
 */
export type ListFilters<TQuery extends ListQuery> = Omit<TQuery, ListOwnedKey>;

/** The filter keys a text field or a choice can write: both produce a string. */
export type StringFilterKey<TQuery extends ListQuery> = {
	[Key in keyof ListFilters<TQuery>]: NonNullable<
		ListFilters<TQuery>[Key]
	> extends string ? Key : never;
}[keyof ListFilters<TQuery>];

/** The filter keys a flag can write: on, or off. */
export type BooleanFilterKey<TQuery extends ListQuery> = {
	[Key in keyof ListFilters<TQuery>]: NonNullable<
		ListFilters<TQuery>[Key]
	> extends boolean ? Key : never;
}[keyof ListFilters<TQuery>];

/**
 * The three shapes a control reports a value by, as props. A call site spreads one onto the control
 * that takes that shape, and names neither the value nor the way it gets back here:
 *
 * ```tsx
 * <Input  placeholder="Search" {...list.text('search')} />
 * <Select options={STATUS_OPTIONS} {...list.choice('status')} />
 * <Switch label="Active" {...list.flag('isActive')} />
 * ```
 *
 * They are named for the value, not for a control. `choice` is one of a set or none, so a select, a
 * radio group and a row of toggle buttons are the same binding — changing which one is drawn never
 * touches the call site. The shapes come from the component library and not from the list: a field
 * that is typed into reports a `value` and an `onChange`, a Base UI root reports either
 * `value`/`onValueChange` or `checked`/`onCheckedChange`.
 */
export type TextBinding = {
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type ChoiceBinding<Value> = {
	value: Value | null;
	onValueChange: (value: Value | null) => void;
};

export type FlagBinding = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

/**
 * What the screen fixes for the life of the list: the order it opens in, and the filters it opens
 * with. The page, the sort the reader picks and any change to a filter are the hook's own state.
 */
export type UseListOptions<TQuery extends ListQuery> = {
	/** The column the list reads by until the reader picks another. */
	sort: SortKeyOf<TQuery>;
	/** Which way round that column reads. Descending by default: the newest record first. */
	order?: SortOrder;
	/**
	 * The filters it opens with, before the reader has touched anything. Only the start: what the
	 * reader chooses after that is the hook's state, so an object written inline here is read once.
	 */
	defaultFilters?: Partial<ListFilters<TQuery>>;
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
	/** What is narrowing the records now, as the wire will read it. A blank filter is not in here. */
	filters: ListFilters<TQuery>;
	/** The column the records were read by, and which way. The table draws its arrow from this. */
	sort: ListSort<SortKeyOf<TQuery>>;
	loading: boolean;
	/** The API's sentence when the last read failed. The caller renders it where the records go. */
	error?: string;
	setPage: (page: number) => void;
	/**
	 * Writes one filter and goes back to the first page, because the records under the cursor have
	 * moved. A blank value — `undefined`, `null`, `''` — removes the filter instead of sending it,
	 * so a cleared field narrows nothing and the next answer is the unnarrowed one.
	 */
	setFilter: <Key extends keyof ListFilters<TQuery>>(
		key: Key,
		value: ListFilters<TQuery>[Key] | null | undefined,
	) => void;
	/**
	 * A title was pressed: another column, the other direction round, or nothing — which is the
	 * press after the last direction, and puts the list back in the order the screen asked for.
	 */
	onSort: (next: ListSort<SortKeyOf<TQuery>> | undefined) => void;
	/** Read the same page again — what a write elsewhere in the domain ends with. */
	reload: () => void;
	/** The field the reader types into, by the key it narrows. */
	text: <Key extends StringFilterKey<TQuery>>(key: Key) => TextBinding;
	/** The control that picks one of a set, by the key it narrows. */
	choice: <Key extends StringFilterKey<TQuery>>(
		key: Key,
	) => ChoiceBinding<NonNullable<ListFilters<TQuery>[Key]>>;
	/** The control that is on or off, by the key it narrows. */
	flag: <Key extends BooleanFilterKey<TQuery>>(key: Key) => FlagBinding;
};
