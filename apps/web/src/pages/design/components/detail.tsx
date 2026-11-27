import { useParams } from 'react-router';
import { Card } from '@/components';
import { DesignShell } from '../shell';
import { TokenList } from '../tokens/list';
import { docOf } from './manifest';
import { entryOf } from './registry';
import { Specimen } from './specimen';

const PropsTable = ({ name }: { name: string }) => {
	const doc = docOf(name);
	if (doc === undefined) return null;

	if (doc.props.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No props of its own: everything is passed through to the parts or the native element.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-left text-sm">
				<thead className="text-xs text-muted-foreground">
					<tr>
						<th className="py-1.5 pe-4 font-medium">Prop</th>
						<th className="py-1.5 pe-4 font-medium">Type</th>
						<th className="py-1.5 font-medium">Note</th>
					</tr>
				</thead>
				<tbody>
					{doc.props.map((prop) => (
						<tr key={prop.name} className="border-t border-border-soft align-top">
							<td className="py-1.5 pe-4 whitespace-nowrap">
								<code className="font-mono text-xs">{prop.name}</code>
								{!prop.optional && <span className="ms-1 text-destructive">*</span>}
							</td>
							<td className="py-1.5 pe-4">
								<code className="font-mono text-xs text-muted-foreground">{prop.type}</code>
							</td>
							<td className="py-1.5 text-xs text-muted-foreground">{prop.description ?? '—'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

const Tokens = ({ name }: { name: string }) => {
	const doc = docOf(name);
	if (doc === undefined) return null;

	const shared = doc.sharedTokens.filter((token) => !doc.tokens.includes(token));

	if (doc.tokens.length === 0 && shared.length === 0) {
		return <p className="text-sm text-muted-foreground">No token references.</p>;
	}

	return (
		<div className="space-y-4">
			{doc.tokens.length > 0 && (
				<div>
					<p className="mb-1.5 text-xs text-muted-foreground">Declared in the component</p>
					<TokenList tokens={doc.tokens} />
				</div>
			)}

			{shared.length > 0 && (
				<div>
					<p className="mb-1.5 text-xs text-muted-foreground">
						From the shared interaction layer <code className="font-mono">lib/control</code>
					</p>
					<TokenList tokens={shared} />
				</div>
			)}
		</div>
	);
};

export const DesignComponentPage = () => {
	const { name = '' } = useParams();
	const doc = docOf(name);
	const entry = entryOf(name);

	return (
		<DesignShell
			title={doc?.name ?? name}
			description={doc === undefined ? undefined : `src/${doc.path}`}
		>
			{doc === undefined ? (
				<p className="text-sm text-muted-foreground">
					<code className="font-mono">{name}</code> is not in the manifest. Run{' '}
					<code className="font-mono">pnpm --filter @lumo/web design:manifest</code>.
				</p>
			) : (
				<div className="space-y-3">
					{entry === undefined ? (
						<p className="rounded-xl border border-border-soft bg-card px-4 py-3 text-sm text-muted-foreground">
							No variants registered in <code className="font-mono">registry.tsx</code> yet, so
							there is no state matrix; props and tokens come from the source manifest.
						</p>
					) : (
						<Specimen entry={entry} />
					)}

					<Card
						title="Props"
						description="Only what the component declares itself; inherited element and variant props are left out."
					>
						<PropsTable name={doc.name} />
					</Card>

					<Card
						title="Tokens"
						description="Click a row to change the value; it applies immediately and can be reset to the source value."
					>
						<Tokens name={doc.name} />
					</Card>
				</div>
			)}
		</DesignShell>
	);
};
