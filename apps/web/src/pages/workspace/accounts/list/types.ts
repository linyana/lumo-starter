import type { ListAccountsQuery, Account } from '@lumo/shared';
import type { SortKeyOf } from '@/hooks';

export type AccountSortKey = SortKeyOf<ListAccountsQuery>;

export type Panel =
	| { kind: 'edit'; account: Account }
	| { kind: 'delete'; accounts: readonly Account[] };

export type OverlayArgs = {
	panel: Panel;
	closePanel: () => void;
	reload: () => void;
};
