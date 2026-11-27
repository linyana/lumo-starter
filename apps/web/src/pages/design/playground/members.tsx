import { Info, Trash2 } from 'lucide-react';
import {
	Accordion,
	Avatar,
	Badge,
	Button,
	Card,
	Checkbox,
	Input,
	Progress,
	RadioGroup,
	Select,
	Separator,
	Skeleton,
	Slider,
	Switch,
	Tabs,
	Textarea,
	Tooltip,
} from '@/components';
import type { Color } from '@/lib/control';

const roles = [
	{ value: 'owner', label: 'Owner' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'member', label: 'Member' },
];

const statuses = [
	{ value: 'active', label: 'Active' },
	{ value: 'invited', label: 'Invited' },
	{ value: 'suspended', label: 'Suspended' },
];

type Member = {
	name: string;
	email: string;
	role: 'Owner' | 'Admin' | 'Member';
	status: 'Active' | 'Invited' | 'Suspended';
};

const members: Member[] = [
	{ name: 'Rik Li', email: 'rik@lumo.dev', role: 'Owner', status: 'Active' },
	{ name: 'Ada Chen', email: 'ada@lumo.dev', role: 'Admin', status: 'Active' },
	{ name: 'Mori Tanaka', email: 'mori@lumo.dev', role: 'Member', status: 'Invited' },
	{ name: 'Sam Fischer', email: 'sam@lumo.dev', role: 'Member', status: 'Suspended' },
	{ name: 'Wei Zhang', email: 'wei@lumo.dev', role: 'Member', status: 'Active' },
];

const statusColor: Record<string, Color> = {
	Active: 'success',
	Invited: 'info',
	Suspended: 'warning',
};

const Overview = () => (
	<div className="grid gap-3 lg:grid-cols-3">
		<Card
			className="lg:col-span-2"
			title="Everyone"
			description="Sorted by last activity."
			action={
				<Badge variant="outline" color="neutral">
					{members.length} shown
				</Badge>
			}
		>
			<div className="flex flex-col">
				{members.map((member) => (
					<div
						key={member.email}
						className="flex items-center gap-3 border-b border-border-soft py-2.5 last:border-b-0"
					>
						<Avatar alt={member.name} size="sm" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{member.name}</p>
							<p className="truncate text-xs text-muted-foreground">{member.email}</p>
						</div>
						<Badge variant="secondary">{member.role}</Badge>
						<Badge variant="soft" color={statusColor[member.status]}>
							{member.status}
						</Badge>
						<Tooltip content="Open member settings" side="bottom">
							<Button variant="ghost" size="sm">
								Manage
							</Button>
						</Tooltip>
					</div>
				))}
			</div>
		</Card>

		<div className="space-y-3">
			<Card size="sm" title="Seats" description="Pro plan, renewed monthly.">
				<div className="space-y-3">
					<Progress value={4} max={10} label="Used" />
					<Slider label="Seat limit" defaultValue={10} min={4} max={30} />
					<Button variant="outline" size="sm" className="w-full">
						Add seats
					</Button>
				</div>
			</Card>

			<Card size="sm" title="Syncing audit log">
				<div className="space-y-2">
					<Skeleton className="h-3 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
					<Skeleton className="h-3 w-2/3" />
				</div>
			</Card>

			<Card size="sm" title="Danger zone" surface="white">
				<p className="text-xs text-muted-foreground">
					Suspending a member revokes every session immediately.
				</p>
				<Button
					variant="outline"
					color="destructive"
					size="sm"
					className="mt-2 w-full"
					icon={<Trash2 />}
				>
					Suspend all
				</Button>
			</Card>
		</div>
	</div>
);

const Activity = () => (
	<Card title="Activity" description="Everything that touched this workspace today.">
		<div className="flex flex-col">
			{[
				{ who: 'Ada Chen', what: 'invited mori@lumo.dev as Member', when: '12 minutes ago' },
				{ who: 'Rik Li', what: 'created the role Billing admin', when: '1 hour ago' },
				{ who: 'System', what: 'revoked 3 sessions after a password change', when: '3 hours ago' },
			].map((event, index) => (
				<div key={event.what}>
					{index > 0 && <Separator />}
					<div className="flex items-center gap-3 py-2.5">
						<Avatar alt={event.who} size="sm" />
						<p className="min-w-0 flex-1 truncate text-sm">
							<span className="font-medium">{event.who}</span>{' '}
							<span className="text-muted-foreground">{event.what}</span>
						</p>
						<span className="shrink-0 text-xs text-muted-foreground">{event.when}</span>
					</div>
				</div>
			))}
		</div>
	</Card>
);

const Settings = () => (
	<div className="space-y-3">
		<Card title="Member defaults" description="Applied to everyone who joins from here on.">
			<div className="space-y-4">
				<div className="grid gap-3 sm:grid-cols-2">
					<Input placeholder="Default display name" defaultValue="New teammate" clearable />
					<Select options={roles} defaultValue="member" ariaLabel="Default role" />
				</div>

				<div>
					<p className="mb-1.5 text-sm font-medium">Default role</p>
					<RadioGroup options={roles} defaultValue="member" aria-label="Default role" />
				</div>

				<div className="space-y-2">
					<p className="text-sm font-medium">Permissions</p>
					<Checkbox label="Can invite members" defaultValue />
					<Checkbox label="Can read the audit log" />
					<Checkbox label="Can manage billing" defaultValue />
				</div>

				<div className="space-y-2">
					<Switch label="Email me when someone joins" defaultValue />
					<Switch label="Require two-factor authentication" />
				</div>

				<Textarea
					placeholder="Welcome message sent with every invite"
					defaultValue="Welcome aboard — ping #general if you need anything."
					clearable
				/>
			</div>
		</Card>

		<Card title="Advanced">
			<Accordion
				defaultValue={['sessions']}
				items={[
					{
						value: 'sessions',
						title: 'Session lifetime',
						content: (
							<p className="text-sm text-muted-foreground">
								Access tokens live 15 minutes, refresh tokens 30 days. Changing this signs everyone
								out.
							</p>
						),
					},
					{
						value: 'webhooks',
						title: 'Webhooks',
						content: <Input placeholder="https://example.com/hooks/lumo" />,
					},
					{
						value: 'delete',
						title: 'Delete workspace',
						content: (
							<Button variant="ghost" color="destructive" size="sm" icon={<Trash2 />}>
								Delete this workspace
							</Button>
						),
					},
				]}
			/>
		</Card>
	</div>
);

export const Members = () => (
	<div className="space-y-3">
		<div className="flex flex-wrap items-center gap-2">
			<Input className="max-w-xs" placeholder="Search by name or email" clearable />
			<Select options={roles} placeholder="Role" ariaLabel="Role" clearable />
			<Select options={statuses} placeholder="Status" ariaLabel="Status" clearable />
			<Button variant="ghost" size="sm">
				Reset
			</Button>
			<Badge variant="secondary" className="ms-auto gap-1">
				<Info className="size-3" /> 128 members
			</Badge>
		</div>

		<Tabs
			items={[
				{ value: 'overview', label: 'Overview', content: <Overview /> },
				{ value: 'activity', label: 'Activity', content: <Activity /> },
				{ value: 'settings', label: 'Settings', content: <Settings /> },
				{ value: 'billing', label: 'Billing', content: <Settings />, disabled: true },
			]}
		/>

		<Card
			title="Invite a teammate"
			description="They get an email with a one-time link."
			footer={
				<>
					<Checkbox label="Send welcome email" defaultValue />
					<Button variant="ghost">Cancel</Button>
					<Button>Send invite</Button>
				</>
			}
		>
			<div className="grid gap-3 sm:grid-cols-2">
				<Input placeholder="Full name" />
				<Input placeholder="name@company.com" />
				<Select options={roles} placeholder="Role" ariaLabel="Invite role" />
				<Input placeholder="Optional note" invalid defaultValue="Hi —" />
			</div>
		</Card>
	</div>
);
