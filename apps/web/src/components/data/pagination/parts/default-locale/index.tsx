import type { PaginationLocale } from '../root';

export const defaultLocale: Required<PaginationLocale> = {
	previous: 'previous page',
	next: 'next page',
	first: 'first page',
	last: 'last page',
	page: 'PaginationPage',
	previousPages: 'previous {count} pages',
	nextPages: 'next {count} pages',
	goTo: 'Go to',
};
