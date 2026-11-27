import { type ReactNode } from 'react';
import {
	Badge,
	badgeVariants,
	Button,
	buttonVariants,
	Card,
	Input,
	inputVariants,
	Select,
} from '@/components';
import { selectTriggerVariants } from '@/components/ui/form/select/parts/trigger';
import type { UiState } from '@/lib/control';

export type SpecimenCell = { label: string; props?: Record<string, unknown> };
export type SpecimenRow = { label: string; props?: Record<string, unknown> };

export type SpecimenEntry = {
	name: string;
	path: string;
	note?: string;
	variants?: Record<string, Record<string, unknown>>;
	rowAxis?: string;
	colAxis?: string;
	states?: { state: UiState; props: Record<string, unknown> }[];
	rows?: SpecimenRow[];
	cells?: SpecimenCell[];
	render: (props: Record<string, unknown>) => ReactNode;
};

const axisRows = (entry: SpecimenEntry, axis: string | undefined): SpecimenRow[] => {
	if (axis === undefined) return [];
	const options = entry.variants?.[axis];
	if (options === undefined) return [];
	return Object.keys(options).map((value) => ({ label: value, props: { [axis]: value } }));
};

export const rowsOf = (entry: SpecimenEntry): SpecimenRow[] =>
	entry.rows ?? axisRows(entry, entry.rowAxis);

export const cellsOf = (entry: SpecimenEntry): SpecimenCell[] =>
	entry.cells ?? [
		...axisRows(entry, entry.colAxis).map((row) => ({ label: row.label, props: row.props })),
		...(entry.states ?? []).map((item) => ({ label: item.state, props: item.props })),
	];

const roleOptions = [
	{ value: 'owner', label: 'Owner' },
	{ value: 'admin', label: 'Admin' },
	{ value: 'member', label: 'Member' },
];

const liveStates = 'hover / focus-visible are real interaction states — hover a cell to see them.';

export const entries: SpecimenEntry[] = [
	{
		name: 'Button',
		path: 'components/ui/form/button',
		note: `${liveStates} Every cell is one of the sizes in the shared ladder.`,
		variants: buttonVariants.variants,
		colAxis: 'size',
		states: [
			{ state: 'disabled', props: { disabled: true } },
			{ state: 'loading', props: { loading: true } },
		],
		rows: [
			{ label: 'primary', props: { variant: 'primary' } },
			{ label: 'secondary', props: { variant: 'secondary' } },
			{ label: 'outline', props: { variant: 'outline' } },
			{ label: 'ghost', props: { variant: 'ghost' } },
			{ label: 'link', props: { variant: 'link' } },
			{ label: 'destructive', props: { variant: 'destructive' } },
		],
		render: (props) => <Button {...(props as Parameters<typeof Button>[0])}>Button</Button>,
	},
	{
		name: 'Input',
		path: 'components/ui/form/input',
		note: `${liveStates} Invalid comes from aria-invalid and the \`failed\` variant.`,
		variants: inputVariants.variants,
		rowAxis: 'size',
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
		variants: selectTriggerVariants.variants,
		rowAxis: 'size',
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
		note: 'The whole grid is derived from the component: one row per tone, one column per emphasis.',
		variants: badgeVariants.variants,
		rowAxis: 'color',
		colAxis: 'variant',
		render: (props) => <Badge {...(props as Parameters<typeof Badge>[0])}>Badge</Badge>,
	},
	{
		name: 'Card',
		path: 'components/ui/display/card',
		note: 'Surface follows the backdrop: gray on a gray page, white inside a white dialog or popover.',
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
