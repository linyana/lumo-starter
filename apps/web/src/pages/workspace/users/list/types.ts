import type { User } from '@lumo/shared';

/**
 * One page of accounts, and the way to another. The query is the screen's: this is handed the
 * records it draws and reports a press back, so it never fetches and never owns the page.
 */
export type UserListProps = {
	rows: User[];
	/** The records in all, which is where the page count comes from. */
	total: number;
	/** The page in view, counted from one. */
	page: number;
	/** How many records one page holds; also the number of skeleton rows. */
	pageSize: number;
	loading: boolean;
	/** Shown in the table's place when the request failed. */
	error?: string;
	onPageChange: (page: number) => void;
	/** Whether the reader may delete another account at all. */
	canDelete: boolean;
	/** The signed-in account, which hides the delete on its own row. */
	currentUserId?: string;
	/** A delete is in flight, so every delete button shows it. */
	deleting?: boolean;
	onDelete: (id: string) => void;
};
