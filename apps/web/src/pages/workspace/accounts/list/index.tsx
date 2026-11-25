import { ROLE_META, type ListAccountsQuery, type Role, type Account } from '@lumo/shared';
import { Pencil, Trash2 } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import { Badge, Field, Form, Input, Table, type TableColumn } from '@/components';
import type { UseQueryResult } from '@/hooks';
import { DeleteAccounts } from '../delete';
import { EditAccount } from '../edit';
import type { OverlayArgs, Panel, AccountSortKey } from './types';

type IPropsType = { list: UseQueryResult<Account, ListAccountsQuery> };

const renderOverlay = ({ panel, closePanel, reload }: OverlayArgs): ReactElement => {
	switch (panel.kind) {
		case 'edit':
			return <EditAccount account={panel.account} closePanel={closePanel} reload={reload} />;
		case 'delete':
			return <DeleteAccounts accounts={panel.accounts} closePanel={closePanel} reload={reload} />;
	}
};

const ROLE_VARIANT: Record<Role, 'default' | 'info' | 'secondary'> = {
	OWNER: 'default',
	ADMIN: 'info',
	MEMBER: 'secondary',
};

export const AccountList = ({ list }: IPropsType) => {
	const [panel, setPanel] = useState<Panel | null>(null);
	const closePanel = () => setPanel(null);

	const columns: TableColumn<Account, AccountSortKey>[] = [
		{
			key: 'name',
			header: 'Name',
			sortKey: 'name',
			cell: (row) => <span className="font-medium">{row.name}</span>,
		},
		{
			key: 'username',
			header: 'Username',
			sortKey: 'username',
			cell: (row) => <span className="font-mono text-muted-foreground">@{row.username}</span>,
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
						<Badge key={role} variant={ROLE_VARIANT[role]}>
							{ROLE_META[role]}
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
					<Input placeholder="Search name, username or email" clearable />
				</Field>
				<Table
					columns={columns}
					list={list}
					pagination={{ items: 'account' }}
					rowLabel={(item) => item.name}
					selectionActions={() => [
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							access: { permission: 'account:delete' },
							variant: 'default',
							onClick: ({ rows }) => setPanel({ kind: 'delete', accounts: rows }),
						},
					]}
					rowActions={(item) => [
						{
							label: 'Edit',
							icon: <Pencil />,
							access: { permission: 'account:write' },
							onClick: () => setPanel({ kind: 'edit', account: item }),
						},
						{
							label: 'Delete',
							icon: <Trash2 />,
							destructive: true,
							separatorBefore: true,
							access: { permission: 'account:delete' },
							onClick: () => setPanel({ kind: 'delete', accounts: [item] }),
						},
					]}
				/>
			</Form>

			{panel !== null && renderOverlay({ panel, closePanel, reload: list.reload })}
		</>
	);
};
