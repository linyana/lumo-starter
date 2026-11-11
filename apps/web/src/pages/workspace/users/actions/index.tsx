import type { User } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '@/components';
import { DeleteUser } from '../delete';
import { EditUser } from '../edit';

/** The panels a row can open, one at a time — the same row cannot edit and be deleted at once. */
type Panel = 'edit' | 'delete';

/** One row's actions: the list a row offers, and the panels behind it. */
type UseUserActionsParams = {
	/** The signed-in account — its own row cannot be deleted, which is this screen's rule. */
	currentUserId?: string;
	/** Whether the reader may open the edit panel. */
	canEdit: boolean;
	/** Whether the reader may delete a row, once its own account is excluded. */
	canDelete: boolean;
	/** Runs once a write has answered, so the caller can re-read the list. */
	onChanged: () => void;
};

/**
 * A row's actions in the two halves a table needs: the list it draws — behind the row's "..." and
 * under a right press, which are the same list — and the panels those rows open.
 *
 * The panels are handed back to be mounted beside the table rather than inside a row: a menu closes
 * on the press that picks an action, and a panel opened from inside it would close with it.
 */
export const useUserActions = ({
	currentUserId,
	canEdit,
	canDelete,
	onChanged,
}: UseUserActionsParams) => {
	const [panel, setPanel] = useState<{ user: User; kind: Panel } | null>(null);
	const close = () => setPanel(null);

	const itemsOf = (user: User): MenuItem[] => {
		const items: MenuItem[] = [];

		if (canEdit) {
			items.push({
				label: 'Edit',
				icon: <Pencil />,
				onClick: () => setPanel({ user, kind: 'edit' }),
			});
		}

		if (canDelete && user.id !== currentUserId) {
			items.push({
				label: 'Delete',
				icon: <Trash2 />,
				destructive: true,
				separatorBefore: true,
				onClick: () => setPanel({ user, kind: 'delete' }),
			});
		}

		return items;
	};

	const dialogs =
		panel === null ? null : panel.kind === 'edit' ? (
			<EditUser
				user={panel.user}
				currentUserId={currentUserId}
				open
				onOpenChange={(next) => {
					if (!next) close();
				}}
				onUpdated={onChanged}
			/>
		) : (
			<DeleteUser
				user={panel.user}
				open
				onOpenChange={(next) => {
					if (!next) close();
				}}
				onDeleted={onChanged}
			/>
		);

	return { itemsOf, dialogs };
};
