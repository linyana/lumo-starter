import type { ListUsersQuery, User } from '@lumo/shared';
import type { SortKeyOf } from '@/hooks';

/** The keys this table may be ordered by: the ones the wire's query knows. */
export type UserSortKey = SortKeyOf<ListUsersQuery>;

/** What the screen has open. One overlay at a time, and each kind carries what it draws. */
export type Panel = { kind: 'edit'; user: User } | { kind: 'delete'; users: readonly User[] };

/** What an overlay borrows from the screen it belongs to: how it is dismissed, what to reload after. */
export type OverlayArgs = {
	panel: Panel;
	onOpenChange: (open: boolean) => void;
	reload: () => void;
};
