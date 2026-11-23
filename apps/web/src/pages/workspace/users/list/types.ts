import type { ListUsersQuery, User } from '@lumo/shared';
import type { SortKeyOf } from '@/hooks';
import type { Dispatch, SetStateAction } from 'react';

export type UserSortKey = SortKeyOf<ListUsersQuery>;

export type Panel = { kind: 'edit'; user: User } | { kind: 'delete'; users: readonly User[] };

export type OverlayArgs = {
	panel: Panel;
	setPanel: Dispatch<SetStateAction<Panel | null>>;
	reload: () => void;
};
