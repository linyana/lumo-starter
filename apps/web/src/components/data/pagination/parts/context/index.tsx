import { createContext, use } from 'react';
import type { PaginationLocale } from '../root';

export type PaginationState = {
	page: number;
	pageCount: number;
	total?: number;
	pageSize?: number;
	items: string;
	locale: Required<PaginationLocale>;
	size: 'sm' | 'md' | 'lg';
	busy: boolean;
	go: (next: number) => void;
};

export const PaginationContext = createContext<PaginationState | null>(null);

export function usePagination(part: string) {
	const state = use(PaginationContext);
	if (state === null) throw new Error(`Pagination.${part} must be inside PaginationRoot`);
	return state;
}
