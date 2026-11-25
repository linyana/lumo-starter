import type { ListMembersQuery, Member, RoleRef } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Badge, Field, Form, Input, Table, type TableColumn } from '@/components';
import type { UseQueryResult } from '@/hooks';
import { DeleteMembers } from '../delete';
import { EditMember } from '../edit';
import type { MemberSortKey, OverlayArgs, Panel } from './types';

type IPropsType = { list: UseQueryResult<Member, ListMembersQuery> };

const renderOverlay = ({ panel, closePanel, reload }: OverlayArgs): ReactElement => {
	switch (panel.kind) {
		case 'edit':
			return <EditMember member={panel.member} closePanel={closePanel} reload={reload} />;
		case 'delete':
			return <DeleteMembers members={panel.members} closePanel={closePanel} reload={reload} />;
	}
};

const ROLE_VARIANT: Record<string, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	MEMBER: 'secondary',
};

const variantOf = (role: RoleRef): 'default' | 'info' | 'secondary' =>
	ROLE_VARIANT[role.key] ?? 'secondary';

export const MemberList = ({ list }: IPropsType) => {
	const [panel, setPanel] = useState<Panel | null>(null);
	const closePanel = () => setPanel(null);

	const columns: TableColumn<Member, MemberSortKey>[] = [
		{
			key: 'username',
			header: 'Username',
			sortKey: 'username',
			cell: (row) => <span className="font-mono font-medium">@{row.username}</span>,
		},
		{
			key: 'email',
			header: 'Email',
			sortKey: 'email',
			filter: list.filterOf({ name: 'email', placeholder: 'Filter email' }),
			cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
		},
		{
			key: 'roles',
			header: 'Roles',
			cell: (row) => (
				<div className="flex flex-wrap gap-1">
					{row.roles.map((role) => (
						<Badge key={role.key} variant={variantOf(role)}>
							{role.name}
						</Badge>
					))}
				</div>
			),
		},
	];

	return (
		<>
			<Form form={list.form} initial={list.opened} onChange={list.write} settle={300}>
				<Field name="search">
					<Input placeholder="Search username or email" clearable />
				</Field>
				<Table
					columns={columns}
					list={list}
					pagination={{ items: 'member' }}
					rowLabel={(item) => `@${item.username}`}
					selectionActions={() => [
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							access: { permission: 'member:delete' },
							variant: 'default',
							onClick: ({ rows }) => setPanel({ kind: 'delete', members: rows }),
						},
					]}
					rowActions={(item) => [
						{
							label: 'Edit',
							icon: <Pencil />,
							access: { permission: 'member:write' },
							onClick: () => setPanel({ kind: 'edit', member: item }),
						},
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							separatorBefore: true,
							access: { permission: 'member:delete' },
							onClick: () => setPanel({ kind: 'delete', members: [item] }),
						},
					]}
				/>
			</Form>

			{panel !== null && renderOverlay({ panel, closePanel, reload: list.reload })}
		</>
	);
};
