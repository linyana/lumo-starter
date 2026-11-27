import { Card } from '@/components';
import {
	COLOR,
	COLOR_ALIAS,
	COLOR_TOKENS,
	EMPHASIS,
	LIVE_STATE,
	SIZE,
	STANDARD,
	STATE,
	STATE_ATTR,
	STRENGTH,
	type UiState,
} from '@/lib/control';
import { DesignShell } from '../shell';

const axisNote: Record<string, string> = {
	size: 'Ordered and relative: `md` means the middle of the ladder, not a pixel value.',
	emphasis: 'Ordered and relative: from a full fill down to text alone. Composed with a color.',
	color: 'Enumerated. One word per meaning, and each word maps onto the color tokens below.',
	strength: 'Ordered and derived: a token suffix, never a second hand-picked color.',
	state: 'Enumerated. Never a prop of its own — it comes from an attribute or `:hover`.',
};

const axisValues: Record<string, readonly string[]> = {
	size: SIZE,
	emphasis: EMPHASIS,
	color: COLOR,
	strength: STRENGTH,
	state: STATE,
};

const axisExample: Record<string, string> = {
	size: 'controlHeight.md → h-(--control-h-md)',
	emphasis: 'bg-(--intent-solid) · bg-(--intent)/10 · border-(--intent-border)',
	color: '[--intent:var(--success)]',
	strength: '--destructive-soft',
	state: 'data-loading',
};

const Chip = ({ children }: { children: string }) => (
	<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap">
		{children}
	</code>
);

const AxisTable = () => (
	<div className="space-y-4">
		{Object.keys(axisValues).map((axis) => (
			<div key={axis}>
				<div className="mb-1.5 flex flex-wrap items-baseline gap-x-2">
					<code className="font-mono text-xs font-semibold">{axis}</code>
					<span className="text-xs text-muted-foreground">{axisNote[axis]}</span>
				</div>
				<div className="flex flex-wrap gap-1.5">
					{axisValues[axis]?.map((value) => (
						<Chip key={value}>{value}</Chip>
					))}
				</div>
				<p className="mt-1.5 font-mono text-xs text-muted-foreground">{axisExample[axis]}</p>
			</div>
		))}
	</div>
);

const ColorTable = () => (
	<table className="w-full text-left text-sm">
		<thead className="text-xs text-muted-foreground">
			<tr>
				<th className="py-1.5 pe-4 font-medium">color</th>
				<th className="py-1.5 pe-4 font-medium">--intent</th>
				<th className="py-1.5 pe-4 font-medium">--intent-solid</th>
				<th className="py-1.5 pe-4 font-medium">--intent-on</th>
				<th className="py-1.5 font-medium">--intent-border</th>
			</tr>
		</thead>
		<tbody>
			{COLOR.map((color) => {
				const tokens = COLOR_TOKENS[color];
				return (
					<tr key={color} className="border-t border-border-soft">
						<td className="py-1.5 pe-4 font-medium">{color}</td>
						{([tokens.color, tokens.solid, tokens.on, tokens.border] as string[]).map((token) => (
							<td key={token} className="py-1.5 pe-4 last:pe-0">
								<code className="font-mono text-xs text-muted-foreground">{token}</code>
							</td>
						))}
					</tr>
				);
			})}
		</tbody>
	</table>
);

const StateTable = () => (
	<table className="w-full text-left text-sm">
		<thead className="text-xs text-muted-foreground">
			<tr>
				<th className="py-1.5 pe-4 font-medium">state</th>
				<th className="py-1.5 font-medium">expressed as</th>
			</tr>
		</thead>
		<tbody>
			{STATE.map((state: UiState) => {
				const live = (LIVE_STATE as readonly UiState[]).includes(state);
				const attr = STATE_ATTR[state as keyof typeof STATE_ATTR];
				return (
					<tr key={state} className="border-t border-border-soft">
						<td className="py-1.5 pe-4 font-medium">{state}</td>
						<td className="py-1.5">
							{live ? (
								<span className="text-xs text-muted-foreground">
									a real pseudo class — nothing can fake it, hover the specimen
								</span>
							) : (
								<code className="font-mono text-xs text-muted-foreground">{attr}</code>
							)}
						</td>
					</tr>
				);
			})}
		</tbody>
	</table>
);

const StandardTable = () => (
	<table className="w-full text-left text-sm">
		<thead className="text-xs text-muted-foreground">
			<tr>
				<th className="py-1.5 pe-4 font-medium">prop</th>
				<th className="py-1.5 font-medium">values taken from shadcn</th>
			</tr>
		</thead>
		<tbody>
			{Object.entries(STANDARD).map(([prop, values]) => (
				<tr key={prop} className="border-t border-border-soft">
					<td className="py-1.5 pe-4 font-mono text-xs font-medium">{prop}</td>
					<td className="py-1.5">
						<div className="flex flex-wrap gap-1.5">
							{values.map((value) => (
								<Chip key={value}>{value}</Chip>
							))}
						</div>
					</td>
				</tr>
			))}
		</tbody>
	</table>
);

export const DesignConceptsPage = () => (
	<DesignShell
		title="Concepts"
		description="The shared vocabulary, defined once in src/lib/control/axes.ts and read by every component and by this page."
	>
		<div className="space-y-3">
			<Card
				title="Five axes"
				description="A component takes its modifier words from these lists and adds none of its own. `satisfies` in each component makes the compiler enforce it."
			>
				<AxisTable />
			</Card>

			<Card
				title="Standard values"
				description="The spellings shadcn uses. Every component accepts them, so code written against shadcn — by a person or by a model — compiles here unchanged."
			>
				<StandardTable />
			</Card>

			<Card
				title="Color"
				description="A color publishes four custom properties on its own element, so one emphasis class serves every color and both modes."
			>
				<ColorTable />
			</Card>

			<Card
				title="Domain words"
				description="A component may keep its own word for the same meaning; it may only be translated here."
			>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					{Object.entries(COLOR_ALIAS).map(([word, color]) => (
						<p key={word} className="font-mono text-xs">
							{word} → <span className="text-muted-foreground">{color}</span>
						</p>
					))}
				</div>
			</Card>

			<Card
				title="State"
				description="Attribute first: a component, a test and this page all force a state the same way."
			>
				<StateTable />
			</Card>

			<Card
				title="Strength"
				description="A token variant of the same color, always computed rather than picked: `--destructive-soft` is `color-mix(in oklab, var(--destructive) 54%, transparent)`, which composites correctly on any surface in either mode."
			>
				<p className="text-sm text-muted-foreground">
					`soft` is always weaker than the base token and `strong` always louder — the direction
					never flips, so the word means the same thing on every token it is appended to.
				</p>
			</Card>
		</div>
	</DesignShell>
);
