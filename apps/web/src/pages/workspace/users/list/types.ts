import type { ListUsersQuery, User } from '@lumo/shared';
import type { SortKeyOf } from '@/hooks';

export type UserSortKey = SortKeyOf<ListUsersQuery>;

export type Panel = { kind: 'edit'; user: User } | { kind: 'delete'; users: readonly User[] };

export type OverlayArgs = {
	panel: Panel;
	onOpenChange: (open: boolean) => void;
	reload: () => void;
};
