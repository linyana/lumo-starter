import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Input } from '@/components';
import { DesignShell } from '../shell';
import { components } from './manifest';

const sorted = [...components].sort((a, b) => a.name.localeCompare(b.name));

export const DesignComponentsPage = () => {
	const [query, setQuery] = useState('');
	const needle = query.trim().toLowerCase();
	const matched = sorted.filter((item) => item.name.toLowerCase().includes(needle));

	return (
		<DesignShell
			title="Components"
			description="Props and tokens are generated from source by scripts/design-manifest.mts."
			actions={
				<Input
					size="sm"
					className="w-52"
					placeholder="Filter components"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					clearable
				/>
			}
		>
			<p className="mb-2 text-sm text-muted-foreground">
				{matched.length} / {components.length} components
			</p>

			<section className="overflow-hidden rounded-xl border border-border-soft bg-card">
				<ul className="divide-y divide-border-soft">
					{matched.map((item) => (
						<li key={item.name}>
							<Link
								to={`/design/components/${item.name}`}
								className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-accent"
							>
								<span className="w-36 shrink-0 font-medium">{item.name}</span>
								<code className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
									{item.path}
								</code>
								<span className="shrink-0 text-xs text-muted-foreground">
									{item.category} · {item.props.length} props ·{' '}
									{item.tokens.length + item.sharedTokens.length} tokens
								</span>
								<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
							</Link>
						</li>
					))}
				</ul>
			</section>
		</DesignShell>
	);
};
