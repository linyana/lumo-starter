import { tv } from 'tailwind-variants';
import type { SettingsGroupItem } from '../../types';

export const settingsGroupContentVariants = tv({
	base: 'min-w-0 wrap-anywhere @sm:justify-self-end',
	variants: {
		width: {
			auto: 'max-w-full',
			control: 'w-full @sm:w-44',
			wide: 'w-full @sm:w-72',
			full: 'w-full',
		},
	},
	defaultVariants: {
		width: 'control',
	},
});

export const SettingsGroupRow = ({ title, description, content, width }: SettingsGroupItem) => (
	<li
		data-slot="settings-group-row"
		className="grid min-h-16 grid-cols-1 items-center gap-x-6 gap-y-2 py-4 text-sm @sm:grid-cols-[minmax(0,1fr)_fit-content(60%)]"
	>
		<div className="min-w-0 wrap-anywhere">
			<div className="font-medium">{title}</div>
			{description !== undefined && <div className="text-muted-foreground">{description}</div>}
		</div>
		<div className={settingsGroupContentVariants({ width })}>{content}</div>
	</li>
);
