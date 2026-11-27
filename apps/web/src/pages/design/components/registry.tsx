import { type ReactNode } from 'react';
import { Badge, Button, Card, Input, Select } from '@/components';

export type SpecimenCell = { label: string; props?: Record<string, unknown> };
export type SpecimenRow = { label: string; props?: Record<string, unknown> };

export type SpecimenEntry = {
	name: string;
	path: string;
	note?: string;
	rows: SpecimenRow[];
	cells: SpecimenCell[];
	render: (props: Record<string, unknown>) => ReactNode;
};

const roleOptions = [
	{ value: 'owner', label: 'Owner' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'member', label: 'Member' },
];

const liveStates = 'hover / focus-visible / pressed are real interaction states — hover a cell.';

export const entries: SpecimenEntry[] = [
	{
		name: 'Button',
		path: 'components/ui/form/button',
		note: liveStates,
		rows: [
			{ label: 'default', props: { variant: 'default' } },
			{ label: 'secondary', props: { variant: 'secondary' } },
			{ label: 'outline', props: { variant: 'outline' } },
			{ label: 'ghost', props: { variant: 'ghost' } },
			{ label: 'link', props: { variant: 'link' } },
			{ label: 'destructive', props: { variant: 'default', tone: 'destructive' } },
		],
		cells: [
			{ label: 'md' },
			{ label: 'sm', props: { size: 'sm' } },
			{ label: 'lg', props: { size: 'lg' } },
			{ label: 'disabled', props: { disabled: true } },
			{ label: 'loading', props: { loading: true } },
		],
		render: (props) => <Button {...(props as Parameters<typeof Button>[0])}>Button</Button>,
	},
	{
		name: 'Input',
		path: 'components/ui/form/input',
		note: `${liveStates} Invalid state comes from aria-invalid and the \`failed\` variant.`,
		rows: [
			{ label: 'sm', props: { size: 'sm' } },
			{ label: 'md', props: { size: 'md' } },
			{ label: 'lg', props: { size: 'lg' } },
		],
		cells: [
			{ label: 'default', props: { placeholder: 'Placeholder' } },
			{ label: 'filled', props: { defaultValue: 'Rik Li', clearable: true } },
			{ label: 'invalid', props: { defaultValue: 'not-an-email', invalid: true } },
			{ label: 'disabled', props: { defaultValue: 'Rik Li', disabled: true } },
			{ label: 'loading', props: { defaultValue: 'Rik Li', loading: true } },
		],
		render: (props) => <Input {...(props as Parameters<typeof Input>[0])} />,
	},
	{
		name: 'Select',
		path: 'components/ui/form/select',
		note: liveStates,
		rows: [
			{ label: 'sm', props: { size: 'sm' } },
			{ label: 'md', props: { size: 'md' } },
			{ label: 'lg', props: { size: 'lg' } },
		],
		cells: [
			{ label: 'empty', props: { placeholder: 'Pick a role' } },
			{ label: 'chosen', props: { defaultValue: 'admin', clearable: true } },
			{ label: 'invalid', props: { placeholder: 'Pick a role', invalid: true } },
			{ label: 'disabled', props: { defaultValue: 'admin', disabled: true } },
			{ label: 'loading', props: { placeholder: 'Pick a role', loading: true } },
		],
		render: (props) => (
			<Select
				{...(props as Parameters<typeof Select<string>>[0])}
				options={roleOptions}
				ariaLabel="Role"
			/>
		),
	},
	{
		name: 'Badge',
		path: 'components/ui/display/badge',
		rows: [
			{ label: 'default', props: { variant: 'default' } },
			{ label: 'secondary', props: { variant: 'secondary' } },
			{ label: 'outline', props: { variant: 'outline' } },
			{ label: 'destructive', props: { variant: 'destructive' } },
			{ label: 'success', props: { variant: 'success' } },
			{ label: 'warning', props: { variant: 'warning' } },
			{ label: 'info', props: { variant: 'info' } },
		],
		cells: [{ label: 'static' }],
		render: (props) => <Badge {...(props as Parameters<typeof Badge>[0])}>Badge</Badge>,
	},
	{
		name: 'Card',
		path: 'components/ui/display/card',
		note: 'surface follows the backdrop: gray on a gray page, white inside a white dialog or popover.',
		rows: [
			{ label: 'gray', props: { surface: 'gray' } },
			{ label: 'white', props: { surface: 'white' } },
		],
		cells: [
			{ label: 'sm', props: { size: 'sm' } },
			{ label: 'md', props: { size: 'md' } },
		],
		render: (props) => (
			<Card
				title="Workspace"
				description="Everything that belongs to this workspace."
				footer="Updated just now"
				{...(props as Parameters<typeof Card>[0])}
			>
				<p className="text-sm">
					Rendered by the design page, with the same props a product page uses.
				</p>
			</Card>
		),
	},
];

export const entryOf = (name: string): SpecimenEntry | undefined =>
	entries.find((item) => item.name.toLowerCase() === name.toLowerCase());
