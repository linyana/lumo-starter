import { createContext, use } from 'react';
import type { PaginationLocale } from '../root';

export type PaginationState = {
	page: number;
	pageCount: number;
	total?: number;
	pageSize?: number;
	/** The records are counted in this noun, singular: the range pluralises it. */
	items: string;
	locale: Required<PaginationLocale>;
	size: 'sm' | 'md' | 'lg';
	/** A read is in the air: every control keeps its place and takes no press. */
	busy: boolean;
	go: (next: number) => void;
};

export const PaginationContext = createContext<PaginationState | null>(null);

export /** The page the parts are drawn for. A part outside a `PaginationRoot` is a mistake, not a case. */
function usePagination(part: string) {
	const state = use(PaginationContext);
	if (state === null) throw new Error(`Pagination.${part} must be inside PaginationRoot`);
	return state;
}
