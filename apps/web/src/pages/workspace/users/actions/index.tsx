import type { User } from '@lumo/shared';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, Menu, type MenuItem } from '@/components';
import { DeleteUser } from '../delete';
import { EditUser } from '../edit';

/** The panels a row can open, one at a time — the same row cannot edit and be deleted at once. */
type Panel = 'edit' | 'delete';

/** One row's actions: the menu it shows, and the two panels behind it. */
type IPropsType = {
	/** The account the row is about. */
	user: User;
	/** The signed-in account — its own row cannot be deleted, which is this screen's rule. */
	currentUserId?: string;
	/** Whether the reader may open the edit panel. */
	canEdit: boolean;
	/** Whether the reader may delete this row, once its own account is excluded. */
	canDelete: boolean;
	/** Runs once a write has answered, so the caller can re-read the list. */
	onChanged: () => void;
};

/**
 * A row's actions, behind one button: a menu is opened, holds the actions the reader may take, and
 * closes — so the column stays one width however many actions a role unlocks. The panels it names
 * are mounted beside the menu rather than inside it: a menu closes on the press that picks a row,
 * and a panel opened from a part that just closed would close with it.
 */
export const UserActions = ({
	user,
	currentUserId,
	canEdit,
	canDelete,
	onChanged,
}: IPropsType) => {
	const [panel, setPanel] = useState<Panel | null>(null);

	const items: MenuItem[] = [
		...(canEdit ? [{ label: 'Edit', icon: <Pencil />, onClick: () => setPanel('edit') }] : []),
		...(canDelete
			? [
					{
						label: 'Delete',
						icon: <Trash2 />,
						destructive: true,
						separatorBefore: true,
						onClick: () => setPanel('delete'),
					},
				]
			: []),
	];

	return (
		<>
			<Menu
				align="end"
				className="min-w-40"
				trigger={
					<Button
						variant="ghost"
						size="icon"
						icon={<Ellipsis />}
						aria-label={`Actions for ${user.name}`}
					/>
				}
				items={items}
			/>

			{canEdit && (
				<EditUser
					user={user}
					currentUserId={currentUserId}
					open={panel === 'edit'}
					onOpenChange={(next) => setPanel(next ? 'edit' : null)}
					onUpdated={onChanged}
				/>
			)}

			{canDelete && (
				<DeleteUser
					user={user}
					open={panel === 'delete'}
					onOpenChange={(next) => setPanel(next ? 'delete' : null)}
					onDeleted={onChanged}
				/>
			)}
		</>
	);
};
