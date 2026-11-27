import { useTokenEditor } from './editor';
import { editTargetOf, inheritedFromLight, isLive, tokenGroups } from './model';
import { TokenRow } from './token-row';

const groups = tokenGroups();

export const TokenPanel = ({ query = '' }: { query?: string }) => {
	const editor = useTokenEditor();
	const needle = query.trim().toLowerCase();

	const visible = groups
		.map((group) => ({
			...group,
			tokens: group.tokens.filter((token) => token.name.toLowerCase().includes(needle)),
		}))
		.filter((group) => group.tokens.length > 0);

	const tokens = visible.flatMap((group) => group.tokens);
	const inherited = tokens.filter((token) =>
		inheritedFromLight({ token, theme: editor.theme }),
	).length;
	const editable = tokens.filter((token) => isLive(editTargetOf(token.name))).length;

	return (
		<div className="space-y-3">
			<p className="text-sm text-muted-foreground">
				{tokens.length} tokens, parsed straight out of{' '}
				<code className="font-mono text-xs">styles/index.css</code> — no second copy in TS. Theme:
				&nbsp;{editor.theme}; {editable} react to edits, the rest are build-time aliases
				{inherited > 0 && `, ${inherited} have no dark override and inherit the light value`}. Click
				any row to change it.
			</p>

			<div className="grid gap-3 lg:grid-cols-2">
				{visible.map((group) => (
					<section
						key={group.key}
						className="rounded-xl border border-border-soft bg-card px-4 py-3"
					>
						<h3 className="text-sm font-semibold">{group.label}</h3>
						{group.note !== undefined && (
							<p className="mt-0.5 text-xs text-muted-foreground">{group.note}</p>
						)}

						<ul className="mt-2 space-y-0.5">
							{group.tokens.map((token) => (
								<li key={token.name}>
									<TokenRow name={token.name} />
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
};
