import type { SettingsGroupItem } from '../../types';

export const SettingsGroupRow = ({ title, description, content }: SettingsGroupItem) => (
	<li
		data-slot="settings-group-row"
		className="grid min-h-16 grid-cols-1 items-center gap-x-6 gap-y-2 py-4 text-sm @sm:grid-cols-[minmax(0,1fr)_fit-content(60%)]"
	>
		<div className="min-w-0 wrap-anywhere">
			<div className="font-medium">{title}</div>
			{description !== undefined && <div className="text-muted-foreground">{description}</div>}
		</div>
		<div className="min-w-0 max-w-full wrap-anywhere @sm:justify-self-end">{content}</div>
	</li>
);
