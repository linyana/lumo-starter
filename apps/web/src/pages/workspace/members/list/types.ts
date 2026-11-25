import type { ListMembersQuery, Member } from '@lumo/shared';
import type { SortKeyOf } from '@/hooks';

export type MemberSortKey = SortKeyOf<ListMembersQuery>;

export type Panel =
	| { kind: 'edit'; member: Member }
	| { kind: 'delete'; members: readonly Member[] };

export type OverlayArgs = {
	panel: Panel;
	closePanel: () => void;
	reload: () => void;
};
