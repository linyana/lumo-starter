import { Fragment } from 'react';
import { cellsOf, rowsOf, type SpecimenEntry } from './registry';

export const Specimen = ({ entry }: { entry: SpecimenEntry }) => {
	const rows = rowsOf(entry);
	const cells = cellsOf(entry);

	return (
		<section className="overflow-hidden rounded-xl border border-border-soft bg-card">
			<header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border-soft px-4 py-3">
				<h2 className="text-sm font-semibold">{entry.name}</h2>
				<code className="font-mono text-xs text-muted-foreground">{entry.path}</code>
				{entry.note !== undefined && (
					<p className="w-full text-xs text-muted-foreground">{entry.note}</p>
				)}
			</header>

			<div className="overflow-x-auto">
				<div
					className="grid min-w-max items-center gap-x-4 gap-y-3 p-4"
					style={{
						gridTemplateColumns: `minmax(6rem, auto) repeat(${cells.length}, minmax(10rem, 1fr))`,
					}}
				>
					<span />
					{cells.map((cell) => (
						<span key={cell.label} className="text-xs font-medium text-muted-foreground">
							{cell.label}
						</span>
					))}

					{rows.map((row) => (
						<Fragment key={row.label}>
							<span className="font-mono text-xs text-muted-foreground">{row.label}</span>
							{cells.map((cell) => (
								<div key={cell.label} className="flex min-h-8 items-center">
									{entry.render({ ...row.props, ...cell.props })}
								</div>
							))}
						</Fragment>
					))}
				</div>
			</div>
		</section>
	);
};
